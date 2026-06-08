"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const FAQS = [
  {
    q: "Preciso ter sistema ou equipe técnica para usar as automações?",
    a: "Não. Desenvolvemos tudo do zero para o seu negócio e integramos com as ferramentas que você já usa: WhatsApp, planilhas, Instagram, e-mail. Você não precisa entender de tecnologia para usar.",
  },
  {
    q: "Funciona para negócio pequeno, com poucos funcionários?",
    a: "É exatamente para esse perfil que a automação mais faz diferença. Negócios pequenos ganham mais com IA porque não precisam contratar mais pessoas para crescer. A automação faz o trabalho de 2 ou 3 atendentes por uma fração do custo.",
  },
  {
    q: "Quanto tempo leva para ver resultado?",
    a: "A primeira automação entra no ar em até 2 semanas. Dependendo do fluxo, o impacto é imediato: leads respondidos em segundos, agendamentos sem intervenção humana, follow-up automático de clientes que sumiram.",
  },
  {
    q: "E se eu não gostar ou a automação não funcionar como esperado?",
    a: "Ajustamos sem custo adicional até funcionar. Trabalhamos mês a mês, sem contrato de longo prazo. Se em algum momento não fizer mais sentido, você cancela sem multa e sem burocracia.",
  },
  {
    q: "Meu segmento é diferente, vocês já atenderam algo parecido?",
    a: "Já entregamos automações em clínicas, e-commerces, salões, imobiliárias, faculdades, lavanderias, distribuidoras e mais, em 11 estados. Se ainda não atendemos seu segmento, fazemos um diagnóstico gratuito para entender se conseguimos ajudar.",
  },
  {
    q: "Quanto custa?",
    a: "O investimento é sob medida: depende do que você quer automatizar e da complexidade do projeto. O diagnóstico é gratuito e sem compromisso. Depois de entender o seu negócio, apresentamos uma proposta clara com escopo e valor. Sem surpresas.",
  },
  {
    q: "Meu WhatsApp vai ficar travado ou vou perder mensagens?",
    a: "Não. Usamos APIs oficiais do WhatsApp Business para não comprometer seu número. O atendente de IA responde os leads, e você mantém controle total para assumir quando quiser.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 bg-bg section-edge-glow">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Perguntas frequentes
          </h2>
          <p className="text-text-muted text-lg">
            O que todo mundo pensa antes de perguntar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                open === i
                  ? "border-accent/30 bg-surface"
                  : "border-white/8 bg-surface hover:border-white/15"
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-medium text-sm leading-snug transition-colors ${open === i ? "text-text-primary" : "text-text-muted"}`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open === i ? "bg-accent text-white" : "bg-white/8 text-text-muted"}`}>
                  {open === i ? <Minus size={13} /> : <Plus size={13} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <p className="px-6 pb-5 text-text-muted text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-text-muted text-sm mb-4">Ainda tem dúvida? Chama direto.</p>
          <a
            href={`https://wa.me/5567996329837?text=${encodeURIComponent("Olá! Vim pelo site da Ideal Automações e tenho uma dúvida.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Tirar dúvida no WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}
