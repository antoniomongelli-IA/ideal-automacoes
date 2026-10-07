"use client"
import { useEffect } from "react"
import { relatarErro } from "@/lib/cardapio/erros"

// Se algo der errado no cardápio, mostra uma tela própria em vez da tela genérica
// do Next, com a mensagem do erro e a versão do site para sabermos o que houve.
export default function ErroCardapio({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error(error)
    // avisa no banco/n8n que o cardápio travou no celular de alguém
    relatarErro(error, `tela de erro do cardápio${error.digest ? ` · digest ${error.digest}` : ""}`)
  }, [error])

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-[#0d0c10] px-8 text-center text-white">
      <div className="text-5xl">🍽️</div>
      <div>
        <h1 className="text-2xl font-bold">Ops, o cardápio travou</h1>
        <p className="mt-2 text-sm text-white/60">Toque em “Tentar de novo”. Se continuar, recarregue a página.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => unstable_retry()} className="rounded-xl bg-white px-5 py-3 font-semibold text-black">
          Tentar de novo
        </button>
        <button onClick={() => location.reload()} className="rounded-xl border border-white/20 px-5 py-3 font-semibold">
          Recarregar
        </button>
      </div>
      <p className="max-w-xs break-words font-mono text-[11px] leading-relaxed text-white/35">
        {error.message || "erro sem mensagem"}
        {error.digest ? ` · ${error.digest}` : ""} · versão {process.env.NEXT_PUBLIC_VERSAO}
      </p>
    </main>
  )
}
