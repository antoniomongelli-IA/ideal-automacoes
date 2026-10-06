"use client"
import { useCallback, useEffect, useState } from "react"
import type { Branding, Restaurante } from "./types"

// Demo: o painel salva a personalização no navegador (localStorage) e o
// cardápio aberto em outra aba atualiza na hora. Em produção isto vira uma
// tabela no banco, editada pelo painel do restaurante.

export interface Personalizacao {
  branding?: Partial<Branding>
  /** ids dos itens marcados como "Item do mês" */
  destaques?: string[]
}

const chave = (slug: string) => `cardapio:personalizacao:${slug}`
const EVENTO = "cardapio:personalizacao"

export function lerPersonalizacao(slug: string): Personalizacao {
  try {
    const raw = localStorage.getItem(chave(slug))
    return raw ? (JSON.parse(raw) as Personalizacao) : {}
  } catch {
    return {}
  }
}

export function salvarPersonalizacao(slug: string, p: Personalizacao) {
  try {
    localStorage.setItem(chave(slug), JSON.stringify(p))
  } catch {
    /* navegador sem storage: segue só na memória */
  }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: slug }))
}

export function usePersonalizacao(slug: string) {
  const [p, setP] = useState<Personalizacao>({})

  useEffect(() => {
    const sync = () => setP(lerPersonalizacao(slug))
    sync()
    const onStorage = (e: StorageEvent) => e.key === chave(slug) && sync()
    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENTO, sync)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENTO, sync)
    }
  }, [slug])

  const atualizar = useCallback(
    (next: Personalizacao) => {
      setP(next)
      salvarPersonalizacao(slug, next)
    },
    [slug],
  )

  return [p, atualizar] as const
}

export function aplicarPersonalizacao(r: Restaurante, p: Personalizacao): Restaurante {
  return {
    ...r,
    branding: { ...r.branding, ...p.branding },
    itens: p.destaques ? r.itens.map((it) => ({ ...it, destaqueDoMes: p.destaques!.includes(it.id) })) : r.itens,
  }
}

// --- visualizações reais desta demo (contadas no navegador) ---

const chaveViews = (slug: string) => `cardapio:views:${slug}`

export function registrarView(slug: string, itemId: string) {
  try {
    const raw = localStorage.getItem(chaveViews(slug))
    const v = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    v[itemId] = (v[itemId] ?? 0) + 1
    localStorage.setItem(chaveViews(slug), JSON.stringify(v))
  } catch {
    /* ignora */
  }
}

export function lerViews(slug: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(chaveViews(slug))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
