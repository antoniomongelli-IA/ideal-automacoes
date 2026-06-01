"use client"
import { motion } from "framer-motion"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { HOW_IT_WORKS } from "@/lib/constants"

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="Como funciona"
          subtitle="Um processo claro, do diagnóstico ao resultado"
        />

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(160,32,240,0.5)]">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-text-primary font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
