"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Send, MessageCircle, Loader2 } from "lucide-react"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { GradientButton } from "@/components/ui/GradientButton"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export function Contato() {
  const [form, setForm] = useState({ name: "", company: "", segment: "", challenge: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm({ name: "", company: "", segment: "", challenge: "" })
    } catch {
      setStatus("error")
    }
  }

  const inputClass = "w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/60 transition-colors"

  return (
    <section id="contato" className="py-24 px-6 bg-bg">
      <div className="max-w-2xl mx-auto">
        <SectionTitle title="Pronto para automatizar seu negócio?" />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col gap-4"
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
            placeholder="Nome da empresa"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Segmento (ex: clínica, imobiliária, e-commerce...)"
            value={form.segment}
            onChange={(e) => setForm({ ...form, segment: e.target.value })}
            required
          />
          <textarea
            className={`${inputClass} resize-none min-h-[120px]`}
            placeholder="Qual é o seu maior desafio hoje?"
            value={form.challenge}
            onChange={(e) => setForm({ ...form, challenge: e.target.value })}
            required
          />

          <GradientButton onClick={() => {}} className="w-full justify-center">
            {status === "loading" ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              <><Send size={16} /> Enviar mensagem</>
            )}
          </GradientButton>

          {status === "success" && (
            <p className="text-green-400 text-sm text-center">✓ Mensagem enviada! Entraremos em contato em breve.</p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-sm text-center">Erro ao enviar. Tente novamente ou use o WhatsApp.</p>
          )}
        </motion.form>

        <div className="mt-6 text-center">
          <p className="text-text-muted text-sm mb-3">Prefere falar direto?</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <MessageCircle size={18} />
            Chame no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
