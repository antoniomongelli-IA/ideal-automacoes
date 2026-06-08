"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { GradientButton } from "@/components/ui/GradientButton"

const NeuralNetwork = dynamic(
  () => import("./NeuralNetwork").then((m) => m.NeuralNetwork),
  { ssr: false }
)

const RobotMascot = dynamic(
  () => import("./RobotMascot").then((m) => m.RobotMascot),
  { ssr: false }
)

const ChatWidget = dynamic(
  () => import("./ChatWidget").then((m) => m.ChatWidget),
  { ssr: false }
)

const TYPEWRITER_WORDS = ["WhatsApp", "Instagram", "seu CRM", "seu time"]

function TypewriterWord() {
  return (
    <span
      className="text-[#CC44FF] font-extrabold"
      style={{ animation: "none" }}
    >
      piloto automático
    </span>
  )
}

export function Hero() {
  const [chatOpen, setChatOpen] = useState(false)
  const [flying, setFlying] = useState(false)

  const handleRobotClick = () => {
    if (flying || chatOpen) { setChatOpen(true); return }
    setFlying(true)
    setTimeout(() => {
      setChatOpen(true)
      setFlying(false)
    }, 650)
  }

  const scrollToHow = () => {
    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg w-full pt-20 lg:pt-0"
    >
      {/* Neural network background */}
      <div className="absolute inset-0 z-0">
        <NeuralNetwork />
      </div>

      {/* Central glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-accent/8 blur-[140px]" />
      </div>

      {/* Chat widget */}
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Hero content — two column layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left: text */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent/40 text-accent text-sm font-medium bg-accent/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ✦ Automação & Inteligência Artificial
          </motion.span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.05] mb-6 tracking-tight">
            Sua empresa no{" "}
            <TypewriterWord />
          </h1>

          <p className="text-text-muted text-base md:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Agentes de IA e automações que eliminam trabalho manual, aceleram
            atendimento e{" "}
            <span className="text-text-primary font-medium">aumentam suas vendas</span>
            , sem depender de mais pessoas.
          </p>

          {/* Social proof mini */}

          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <GradientButton href="#contato">
              Quero automatizar meu negócio <ArrowRight size={16} />
            </GradientButton>
            <GradientButton variant="outline" onClick={scrollToHow}>
              Ver como funciona <ChevronDown size={16} />
            </GradientButton>
          </div>
        </motion.div>

        {/* Right: robot */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center lg:w-[380px] gap-2">
          <RobotMascot onOpen={handleRobotClick} chatOpen={chatOpen} flying={flying} />
          {/* Mobile hint — só aparece em telas pequenas */}
          <p className="lg:hidden text-xs text-text-muted/60 text-center">
            Toque no robô para testar a IA
          </p>
        </div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-xs text-text-muted/50 tracking-widest uppercase">scroll</span>
        <ChevronDown size={20} className="text-text-muted/50" />
      </motion.div>
    </section>
  )
}
