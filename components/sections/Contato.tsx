"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send, Loader2, CheckCircle } from "lucide-react"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { WHATSAPP_NUMBER } from "@/lib/constants"

const GARGALOS = [
  "Atendimento lento / perda de clientes",
  "Follow-up manual de leads",
  "Tarefas repetitivas que consomem minha equipe",
  "Agendamentos e confirmações manuais",
  "Emissão de documentos / relatórios",
  "Integração entre sistemas (CRM, ERP, etc.)",
  "Outro gargalo",
]

const SEGMENTOS = [
  "Clínica / Saúde",
  "Imobiliária",
  "E-commerce",
  "Salão de Beleza",
  "Educação",
  "Advocacia",
  "Restaurante / Food",
  "Prestador de Serviço",
  "Outro",
]

export function Contato() {
  const [form, setForm] = useState({ name: "", whatsapp: "", segment: "", gargalo: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      await fetch("https://webhook.idealautomacoes.com.br/webhook/testando", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.name,
          whatsapp: form.whatsapp,
          segmento: form.segment,
          gargalo: form.gargalo,
          origem: "formulario-site",
          timestamp: new Date().toISOString(),
        }),
      })
      setStatus("success")
      setForm({ name: "", whatsapp: "", segment: "", gargalo: "" })
    } catch {
      setStatus("error")
    }
  }

  const inputClass =
    "w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/60 transition-colors"

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Vim pelo site da Ideal Automações e quero saber mais sobre automação para o meu negócio.")}`

  if (status === "success") {
    return (
      <section id="contato" className="py-24 px-6 bg-surface">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Mensagem recebida!</h3>
              <p className="text-text-muted">Entraremos em contato em até 5 minutos..</p>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <MessageCircle size={16} />
              Ou chame agora no WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="contato" className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="Agende seu diagnóstico gratuito"
          subtitle="Preencha abaixo e entraremos em contato em até 5 minutos pelo WhatsApp"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 items-start">

          {/* Formulário */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-bg border border-white/8 rounded-2xl p-5 sm:p-8 flex flex-col gap-4"
          >
            <input
              className={inputClass}
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Seu WhatsApp (com DDD)"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              type="tel"
              required
            />
            <select
              className={`${inputClass} cursor-pointer`}
              value={form.segment}
              onChange={(e) => setForm({ ...form, segment: e.target.value })}
              required
            >
              <option value="" disabled>Qual é o seu segmento?</option>
              {SEGMENTOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className={`${inputClass} cursor-pointer`}
              value={form.gargalo}
              onChange={(e) => setForm({ ...form, gargalo: e.target.value })}
              required
            >
              <option value="" disabled>Qual é seu maior gargalo hoje?</option>
              {GARGALOS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm mt-1 disabled:opacity-60"
            >
              {status === "loading" ? (
                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              ) : (
                <><Send size={15} /> Quero meu diagnóstico gratuito</>
              )}
            </button>

            {status === "error" && (
              <p className="text-red-400 text-xs text-center">
                Erro ao enviar. Tente pelo WhatsApp abaixo.
              </p>
            )}

            <p className="text-text-muted text-xs text-center">
              Sem spam. Sem ligações indesejadas. Só resultado.{" "}
              <a href="/privacidade" className="underline hover:text-text-primary transition-colors">Política de Privacidade</a>
            </p>
          </motion.form>

          {/* Lado direito — alternativa + garantias */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* WhatsApp direto */}
            <div className="bg-bg border border-white/8 rounded-2xl p-6">
              <p className="text-text-muted text-sm mb-4">Prefere falar agora?</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm w-full justify-center"
              >
                <MessageCircle size={18} />
                Chamar no WhatsApp agora
              </a>
              <p className="text-text-muted text-xs text-center mt-3">Respondemos em até 5 minutos</p>
            </div>

            {/* Mini garantias */}
            <div className="flex flex-col gap-3">
              {[
                "Diagnóstico gratuito, sem compromisso",
                "Sem contrato de longo prazo",
                "Resultado em 2 semanas ou ajustamos sem custo",
                "Suporte incluso no primeiro mês",
              ].map((g) => (
                <div key={g} className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-accent font-bold text-base leading-none">✓</span>
                  {g}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
