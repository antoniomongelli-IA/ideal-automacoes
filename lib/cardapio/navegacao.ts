"use client"
import { useCallback, useEffect, useRef, useState } from "react"

export type Aba = "feed" | "top" | "mes" | "cardapio"

/** Uma "tela" do cardápio: a aba, o prato em que o feed está e a folha de detalhes aberta. */
export interface Tela {
  aba: Aba
  /** prato em que o feed está (ou deve abrir) */
  feedId?: string
  /** prato com a folha de detalhes aberta */
  info?: string
  /**
   * Vídeo aberto por cima de uma lista (Cardápio, Mais pedidos, Do mês).
   * A aba não muda: ao voltar, a pessoa continua na lista onde estava.
   * `lista` são os pratos que dá para rolar dentro desse vídeo.
   */
  video?: { id: string; lista: string[]; n: number }
  /** muda quando o feed precisa reabrir num prato específico */
  n: number
}

interface EstadoHistorico {
  cardapio: Tela
  profundidade: number
}

const lerEstado = (s: unknown): EstadoHistorico | null =>
  s && typeof s === "object" && "cardapio" in s ? (s as EstadoHistorico) : null

// O Safari bloqueia a página (e mostra erro) se ela chamar pushState/replaceState
// demais em poucos segundos. Por isso nunca deixamos uma falha aqui derrubar o app.
function gravarHistorico(tipo: "push" | "replace", estado: EstadoHistorico) {
  try {
    if (tipo === "push") history.pushState(estado, "")
    else history.replaceState({ ...history.state, ...estado }, "")
  } catch {
    /* histórico indisponível ou limitado: a navegação segue só na memória */
  }
}

const mesmaTela = (a: Tela, b: Tela) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Navegação com "voltar".
 *
 * No site, cada tela vira uma entrada no histórico do navegador. Assim o gesto
 * nativo de arrastar da borda (iPhone) e o botão/gesto voltar (Android) voltam
 * para a tela anterior do cardápio em vez de sair do site.
 *
 * Embutido (prévia no painel e na página de vendas) a pilha fica só na memória,
 * para não mexer no histórico da página que hospeda a prévia.
 */
export function useNavegacao(inicial: Tela, embutido: boolean) {
  const [pilha, setPilha] = useState<Tela[]>([inicial])
  // a pilha também fica num ref para os callbacks lerem o valor mais novo
  const pilhaRef = useRef(pilha)
  // atualizações de posição (rolar o feed) vão para o histórico agrupadas, no máximo 1 a cada 400ms
  const replacePendente = useRef<ReturnType<typeof setTimeout>>(undefined)
  const definir = useCallback((nova: Tela[]) => {
    pilhaRef.current = nova
    setPilha(nova)
  }, [])

  useEffect(() => {
    if (embutido) return
    // a tela inicial entra no histórico sem criar entrada nova
    gravarHistorico("replace", { cardapio: pilhaRef.current[0], profundidade: 0 })

    const onPop = (e: PopStateEvent) => {
      const est = lerEstado(e.state)
      if (!est) return
      // reconstrói a pilha até a profundidade da entrada do histórico
      const p = pilhaRef.current
      const base = p.slice(0, est.profundidade)
      while (base.length < est.profundidade) base.push(p[0])
      definir([...base, est.cardapio])
    }
    window.addEventListener("popstate", onPop)
    return () => {
      window.removeEventListener("popstate", onPop)
      clearTimeout(replacePendente.current)
    }
  }, [embutido, definir])

  const tela = pilha[pilha.length - 1]
  const podeVoltar = pilha.length > 1

  const ir = useCallback(
    (proxima: Tela) => {
      const p = pilhaRef.current
      // grava a posição pendente da tela atual antes de empilhar a próxima
      if (!embutido && replacePendente.current) {
        clearTimeout(replacePendente.current)
        replacePendente.current = undefined
        gravarHistorico("replace", { cardapio: p[p.length - 1], profundidade: p.length - 1 })
      }
      definir([...p, proxima])
      if (!embutido) gravarHistorico("push", { cardapio: proxima, profundidade: p.length })
    },
    [embutido, definir],
  )

  /**
   * Atualiza a tela atual sem criar passo de "voltar" (ex.: posição do feed).
   * Aceita uma função que recebe a tela atual; se ela devolver null, nada muda.
   */
  const atualizar = useCallback(
    (mudanca: Partial<Tela> | ((atual: Tela) => Partial<Tela> | null)) => {
      const p = pilhaRef.current
      const parcial = typeof mudanca === "function" ? mudanca(p[p.length - 1]) : mudanca
      if (!parcial) return
      const atual = { ...p[p.length - 1], ...parcial }
      if (mesmaTela(atual, p[p.length - 1])) return
      definir([...p.slice(0, -1), atual])
      if (embutido) return
      clearTimeout(replacePendente.current)
      replacePendente.current = setTimeout(() => {
        replacePendente.current = undefined
        // só grava se essa ainda é a tela do topo
        const agora = pilhaRef.current
        if (agora[agora.length - 1] === atual) gravarHistorico("replace", { cardapio: atual, profundidade: agora.length - 1 })
      }, 400)
    },
    [embutido, definir],
  )

  const voltar = useCallback(() => {
    const p = pilhaRef.current
    if (p.length <= 1) return
    if (embutido) definir(p.slice(0, -1))
    else history.back()
  }, [embutido, definir])

  return { tela, podeVoltar, ir, atualizar, voltar }
}

/** iPhone/iPad já têm o gesto nativo de voltar; nos outros, usamos o nosso. */
export function temVoltarNativo() {
  if (typeof navigator === "undefined") return false
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}
