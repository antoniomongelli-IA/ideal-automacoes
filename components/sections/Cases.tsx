"use client"
import { motion } from "framer-motion"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { CASES } from "@/lib/constants"

export function Cases() {
  return (
    <section id="cases" className="py-24 px-6 bg-bg">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Resultados reais para empresas reais"
          subtitle="Projetos implementados com impacto mensurável"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASES.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-accent/30 transition-all duration-300"
            >
              <div>
                <span className="text-xs text-accent font-semibold uppercase tracking-wide">{c.niche}</span>
                <h3 className="text-text-primary font-bold text-lg mt-1">{c.company}</h3>
              </div>

              <div className="space-y-2 text-sm text-text-muted flex-1">
                <p><span className="text-text-primary font-medium">Problema:</span> {c.problem}</p>
                <p><span className="text-text-primary font-medium">Solução:</span> {c.solution}</p>
              </div>

              <div className="mt-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-accent font-semibold text-sm">✦ {c.result}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
