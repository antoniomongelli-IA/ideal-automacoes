"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { CASES } from "@/lib/constants"
import { useTilt } from "@/hooks/useTilt"

function CaseCard({ c, i }: { c: typeof CASES[0]; i: number }) {
  const tilt = useTilt(7)
  const [hovered, setHovered] = useState(false)
  const [glareKey, setGlareKey] = useState(0)

  const handleMouseEnter = () => {
    setHovered(true)
    setGlareKey(k => k + 1)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    tilt.onMouseLeave()
    setHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: i * 0.08 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { tilt.onMouseLeave(); setHovered(false) }}
      onMouseMove={(e) => tilt.onMouseMove(e as React.MouseEvent<HTMLElement>)}
      className="group cursor-pointer"
      style={tilt.style}
    >
      <div className="relative rounded-2xl p-[1px] overflow-hidden h-full">

        {/* Rotating beam */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "-150%",
            background: `conic-gradient(from 0deg, transparent 0%, transparent 55%, ${c.brandColor}99 65%, ${c.brandColor} 70%, ${c.brandColor}99 75%, transparent 82%)`,
            animation: "border-beam 3s linear infinite",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        <a
          href="#contato"
          className="relative rounded-[15px] bg-[#0f0d1c] flex flex-col p-6 gap-5 overflow-hidden block h-full"
        >
          {/* Glare sweep */}
          <div
            key={glareKey}
            className="absolute top-0 bottom-0 w-24 pointer-events-none z-20"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
              animation: hovered ? "glare-sweep 0.6s ease-out forwards" : "none",
              left: 0,
            }}
          />

          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: c.brandColor,
              opacity: hovered ? 0.9 : 0.5,
              transition: "opacity 0.3s",
            }}
          />

          {/* Logo */}
          <div className="flex items-center justify-center h-16">
            <img
              src={c.logo}
              alt={c.company}
              className="w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ maxHeight: c.company === "Vila da Mônica" ? "52px" : "60px", maxWidth: "140px" }}
            />
          </div>

          <div className="h-px bg-white/6" />

          {/* Result */}
          <div
            className="text-sm font-semibold leading-snug relative"
            style={{ color: c.brandColor }}
          >
            ✓ {c.result}
          </div>

          {/* Niche */}
          <div className="mt-auto relative">
            <span className="text-xs text-text-muted bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
              {c.niche}
            </span>
          </div>
        </a>
      </div>
    </motion.div>
  )
}

export function Cases() {
  return (
    <section id="cases" className="py-24 px-6 bg-bg">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="Resultados reais para empresas reais"
          subtitle="Cases de automação com impacto mensurável"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {CASES.map((c, i) => (
            <CaseCard key={c.company} c={c} i={i} />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 text-text-muted text-sm font-medium hover:border-accent/50 hover:text-accent transition-all duration-300"
          >
            Quero resultados como esses →
          </a>
        </div>
      </div>
    </section>
  )
}
