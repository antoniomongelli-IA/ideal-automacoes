"use client"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { GradientButton } from "@/components/ui/GradientButton"

const ParticleField = dynamic(
  () => import("./ParticleField").then((m) => m.ParticleField),
  { ssr: false }
)

export function Hero() {
  const scrollToHow = () => {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg">
      <div className="absolute inset-0 z-0">
        <ParticleField />
      </div>

      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-accent/40 text-accent text-sm font-medium bg-accent/10">
            Automação & Inteligência Artificial
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-6">
            Sua empresa no{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              piloto automático
            </span>
          </h1>

          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Agentes de IA e automações que eliminam trabalho manual, aceleram atendimento e aumentam suas vendas — sem depender de mais pessoas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradientButton href="#contato">
              Quero automatizar meu negócio <ArrowRight size={16} />
            </GradientButton>
            <GradientButton variant="outline" onClick={scrollToHow}>
              Ver como funciona <ChevronDown size={16} />
            </GradientButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={24} className="text-text-muted" />
      </motion.div>
    </section>
  )
}
