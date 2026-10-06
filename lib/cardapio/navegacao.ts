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
  /** muda quando o feed precisa reabrir num prato específico */
  n: number
}

interface EstadoHistorico {
  cardapio: Tela
  profundidade: number
}

const lerEstado = (s: unknown): EstadoHistorico | null =>
  s && typeof s === "object" && "cardapio" in s ? (s as EstadoHistorico) : null

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
  const definir = useCallback((nova: Tela[]) => {
    pilhaRef.current = nova
    setPilha(nova)
  }, [])

  useEffect(() => {
    if (embutido) return
    // a tela inicial entra no histórico sem criar entrada nova
    history.replaceState({ ...history.state, cardapio: pilhaRef.current[0], profundidade: 0 } satisfies EstadoHistorico, "")

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
    return () => window.removeEventListener("popstate", onPop)
  }, [embutido, definir])

  const tela = pilha[pilha.length - 1]
  const podeVoltar = pilha.length > 1

  const ir = useCallback(
    (proxima: Tela) => {
      const p = pilhaRef.current
      definir([...p, proxima])
      if (!embutido) history.pushState({ cardapio: proxima, profundidade: p.length } satisfies EstadoHistorico, "")
    },
    [embutido, definir],
  )

  /** Atualiza a tela atual sem criar passo de "voltar" (ex.: posição do feed). */
  const atualizar = useCallback(
    (parcial: Partial<Tela>) => {
      const p = pilhaRef.current
      const atual = { ...p[p.length - 1], ...parcial }
      definir([...p.slice(0, -1), atual])
      if (!embutido) history.replaceState({ ...history.state, cardapio: atual, profundidade: p.length - 1 } satisfies EstadoHistorico, "")
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
