"use client"
import { useEffect, useState } from "react"
import { Eye, Heart, Info, Loader2, MessageCircle, Share2, Star, UserCheck, Users } from "lucide-react"
import { supabaseNavegador } from "@/lib/supabase/cliente"
import { GraficoBarras, GraficoLinha } from "../Graficos"

interface Resumo {
  dias: number
  totais: {
    pessoas: number
    visualizacoes: number
    curtidas: number
    compartilhamentos: number
    detalhes: number
    pessoas_ant: number
    visualizacoes_ant: number
    curtidas_ant: number
    compartilhamentos_ant: number
    /* podem faltar se o schema.sql novo ainda não foi rodado */
    pedidos_whatsapp?: number
    pedidos_whatsapp_ant?: number
    avaliacoes_google?: number
  }
  por_dia: { dia: string; pessoas: number; visualizacoes: number }[]
  por_hora: { hora: number; pessoas: number }[]
  por_item: { id: string; nome: string; visualizacoes: number; curtidas: number; compartilhamentos: number; detalhes: number }[]
  clientes_com_conta: number
}

const card = "rounded-2xl border border-white/[0.07] bg-[#15141a]"

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (!anterior) return <span className="text-xs text-white/40">sem período anterior</span>
  const pct = Math.round(((atual - anterior) / anterior) * 100)
  return <span className={`text-xs font-semibold ${pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pct >= 0 ? `+${pct}` : pct}% vs período anterior</span>
}

/** Números reais do cardápio, calculados no banco a partir dos eventos. */
export function Resultados({ estId }: { estId: string }) {
  const [dias, setDias] = useState(30)
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    let vivo = true
    supabaseNavegador()
      .rpc("resumo_painel", { p_est: estId, p_dias: dias })
      .then(({ data, error }) => {
        if (!vivo) return
        if (error) setErro(error.message)
        else setResumo(data as Resumo)
      })
    return () => {
      vivo = false
    }
  }, [estId, dias])

  if (erro) return <p className="text-rose-400">Não foi possível carregar os resultados: {erro}</p>
  if (!resumo)
    return (
      <p className="flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando resultados…
      </p>
    )

  const t = resumo.totais
  const vazio = t.pessoas === 0 && t.visualizacoes === 0
  const kpis = [
    { l: "Pessoas que abriram o cardápio", v: t.pessoas, a: t.pessoas_ant, i: Users },
    { l: "Vídeos assistidos", v: t.visualizacoes, a: t.visualizacoes_ant, i: Eye },
    { l: "Curtidas", v: t.curtidas, a: t.curtidas_ant, i: Heart },
    { l: "Compartilhamentos", v: t.compartilhamentos, a: t.compartilhamentos_ant, i: Share2 },
  ]
  const fmtDia = (d: string) => {
    const [, m, dd] = d.split("-")
    return `${Number(dd)}/${Number(m)}`
  }
  const topItens = resumo.por_item.filter((i) => i.visualizacoes > 0).slice(0, 10)
  const horas = [...resumo.por_hora].sort((a, b) => a.hora - b.hora)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/60">Período:</span>
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setDias(d)} className={`rounded-full px-3 py-1 text-sm ${dias === d ? "bg-white font-semibold text-black" : "bg-white/[0.06]"}`}>
            {d} dias
          </button>
        ))}
      </div>

      {vazio && (
        <p className={`${card} p-4 text-sm text-white/70`}>
          Ainda não há visitas neste período. Assim que os clientes abrirem o cardápio pelo QR Code ou pela etiqueta NFC, os números aparecem aqui.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className={`${card} p-4`}>
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <k.i className="h-3.5 w-3.5" /> {k.l}
            </div>
            <div className="mt-1.5 text-2xl font-extrabold tabular-nums">{k.v.toLocaleString("pt-BR")}</div>
            <Variacao atual={k.v} anterior={k.a} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className={`${card} p-4`}>
          <h3 className="mb-2 font-semibold">Pessoas por dia</h3>
          <GraficoLinha dados={resumo.por_dia.map((d) => ({ rotulo: fmtDia(d.dia), valor: d.pessoas }))} unidade="pessoas" />
        </div>
        <div className={`${card} p-4`}>
          <h3 className="mb-3 font-semibold">Itens mais assistidos</h3>
          {topItens.length ? <GraficoBarras dados={topItens.map((i) => ({ rotulo: i.nome, valor: i.visualizacoes }))} /> : <p className="text-sm text-white/50">Sem dados ainda.</p>}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={`${card} p-4`}>
          <h3 className="mb-3 font-semibold">Horários de mais movimento</h3>
          {horas.length ? <GraficoBarras dados={horas.map((h) => ({ rotulo: `${String(h.hora).padStart(2, "0")}h`, valor: h.pessoas }))} /> : <p className="text-sm text-white/50">Sem dados ainda.</p>}
        </div>
        <div className={`${card} space-y-3 p-4`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06]">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">{resumo.clientes_com_conta.toLocaleString("pt-BR")}</div>
              <div className="text-xs text-white/55">clientes criaram conta para guardar favoritos</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="flex items-center gap-1.5 text-xs text-white/55">
                <MessageCircle className="h-3.5 w-3.5" /> Pedidos pelo WhatsApp
              </div>
              <div className="mt-1 text-xl font-extrabold tabular-nums">{(t.pedidos_whatsapp ?? 0).toLocaleString("pt-BR")}</div>
              <Variacao atual={t.pedidos_whatsapp ?? 0} anterior={t.pedidos_whatsapp_ant ?? 0} />
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="flex items-center gap-1.5 text-xs text-white/55">
                <Star className="h-3.5 w-3.5" /> Cliques em “Avaliar no Google”
              </div>
              <div className="mt-1 text-xl font-extrabold tabular-nums">{(t.avaliacoes_google ?? 0).toLocaleString("pt-BR")}</div>
            </div>
          </div>
          <div className="text-sm text-white/55">{t.detalhes.toLocaleString("pt-BR")} vezes alguém abriu os detalhes de um item.</div>
          <details className="rounded-xl bg-white/[0.04] p-3 text-sm text-white/70">
            <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-white">
              <Info className="h-4 w-4" /> Como os números são contados
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><b>Pessoas</b>: aparelhos diferentes que abriram o cardápio (cada celular conta uma vez por período).</li>
              <li><b>Vídeos assistidos</b>: quando a pessoa para pelo menos 1 segundo num item.</li>
              <li><b>Curtidas</b>: toques no coração (curtir duas vezes não soma).</li>
              <li><b>Compartilhamentos</b>: toques em “Enviar” num item.</li>
              <li><b>Pedidos pelo WhatsApp</b>: toques no botão “Pedir” (abre o WhatsApp com a mensagem pronta; o pedido em si é fechado na conversa).</li>
              <li>Nenhum dado pessoal é coletado de quem só olha o cardápio.</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  )
}
