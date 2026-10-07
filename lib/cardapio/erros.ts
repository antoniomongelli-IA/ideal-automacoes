"use client"
import { SUPABASE_CHAVE, SUPABASE_URL, supabaseConfigurado } from "@/lib/supabase/cliente"
import { visitante } from "./publico"

// Monitor de erros: o que quebrar no celular de alguém vai para a tabela "erros" do banco,
// e o webhook.sql avisa no n8n (no máximo 1 aviso por erro igual a cada hora).

// Erros que não são do site (extensões, rede caindo, vídeo interrompido pelo próprio navegador)
const IGNORAR = [
  /ResizeObserver loop/i,
  /The play\(\) request was interrupted/i,
  /play\(\) failed because the user didn't interact/i,
  /AbortError/i,
  /NotAllowedError/i,
  /Load failed/i,
  /Failed to fetch/i,
  /NetworkError/i,
  /Script error\.?$/i,
  /chrome-extension:|moz-extension:|safari-extension:/i,
]

const enviados = new Set<string>()
let total = 0

/** Envia um erro para o banco. Cada erro igual vai uma vez por página aberta (no máximo 5). */
export function relatarErro(erro: unknown, detalheExtra?: string) {
  try {
    if (!supabaseConfigurado || typeof window === "undefined") return
    const e = erro instanceof Error ? erro : new Error(typeof erro === "string" ? erro : JSON.stringify(erro))
    const mensagem = `${e.name && e.name !== "Error" ? `${e.name}: ` : ""}${e.message || "erro sem mensagem"}`.slice(0, 500)
    const detalhe = [detalheExtra, e.stack].filter(Boolean).join("\n").slice(0, 4000)
    if (IGNORAR.some((r) => r.test(mensagem) || r.test(detalhe))) return
    if (enviados.has(mensagem) || total >= 5) return
    enviados.add(mensagem)
    total++
    const caminho = location.pathname
    const slug = caminho.match(/^\/cardapio\/([^/?#]+)/)?.[1]
    fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_erro`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_CHAVE, Authorization: `Bearer ${SUPABASE_CHAVE}` },
      body: JSON.stringify({
        p_slug: slug && !["painel", "cadastro", "entrar"].includes(slug) ? slug : null,
        p_pagina: caminho + location.search,
        p_mensagem: mensagem,
        p_detalhe: detalhe,
        p_navegador: navigator.userAgent,
        p_versao: process.env.NEXT_PUBLIC_VERSAO ?? "",
        p_visitante: visitante(),
      }),
    }).catch(() => {})
  } catch {
    /* o monitor nunca pode derrubar o site */
  }
}

let ligado = false

/** Começa a escutar erros não tratados da página. */
export function ligarMonitorErros() {
  if (ligado || typeof window === "undefined") return
  ligado = true
  window.addEventListener("error", (ev) => {
    // erro ao carregar imagem/vídeo não tem "error"; ignora
    if (!ev.error && !ev.message) return
    relatarErro(ev.error ?? ev.message, ev.filename ? `${ev.filename}:${ev.lineno}:${ev.colno}` : undefined)
  })
  window.addEventListener("unhandledrejection", (ev) => relatarErro(ev.reason, "promessa não tratada"))
}
