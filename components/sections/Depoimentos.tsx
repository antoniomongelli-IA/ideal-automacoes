"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORIAS = [
  {
    id: "ia",
    label: "Agente de IA",
    emoji: "🤖",
    images: [
      "/depoimentos/IA.jfif",
      "/depoimentos/IA2.jfif",
      "/depoimentos/IA3.jfif",
      "/depoimentos/IA4.jfif",
      "/depoimentos/IA5.jfif",
    ],
  },
  {
    id: "agendamento",
    label: "Agendamento",
    emoji: "📅",
    images: ["/depoimentos/AGENDAMENTO.jfif"],
  },
  {
    id: "trafego",
    label: "Tráfego Pago",
    emoji: "📈",
    images: ["/depoimentos/TRAFEGO.jfif"],
  },
  {
    id: "mentoria",
    label: "Mentoria",
    emoji: "🎓",
    images: [
      "/depoimentos/MENTORIA.jfif",
      "/depoimentos/MENTORIA2.jfif",
      "/depoimentos/MENTORIA3.jfif",
    ],
  },
]

// Lista plana de todos os slides: { tabIdx, imgSrc }
const ALL_SLIDES = CATEGORIAS.flatMap((cat, tabIdx) =>
  cat.images.map((src) => ({ tabIdx, imgSrc: src }))
)

const SLIDE_INTERVAL = 4000

export function Depoimentos() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const activeTab = ALL_SLIDES[current].tabIdx

  const go = (idx: number) => {
    setCurrent((idx + ALL_SLIDES.length) % ALL_SLIDES.length)
  }

  // Auto-avança por imagem
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ALL_SLIDES.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(t)
  }, [paused])

  // Clicar na aba vai para a primeira imagem daquela categoria
  const goToTab = (tabIdx: number) => {
    const firstSlide = ALL_SLIDES.findIndex((s) => s.tabIdx === tabIdx)
    if (firstSlide !== -1) { go(firstSlide); setPaused(true) }
  }

  return (
    <section id="depoimentos" className="py-24 px-6 bg-surface overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Quem já automatizou, fala por si
          </h2>
          <p className="text-text-muted text-lg">Resultados reais de clientes reais.</p>
        </motion.div>

        {/* Abas — indicam a categoria da imagem atual */}
        <div
          className="flex items-center justify-center gap-2 mb-10 flex-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {CATEGORIAS.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => goToTab(i)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden ${
                activeTab === i
                  ? "bg-accent text-white shadow-[0_0_20px_rgba(160,32,240,0.35)]"
                  : "border border-white/10 text-text-muted hover:border-accent/40 hover:text-text-primary"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
              {/* barra de progresso — reseta a cada slide */}
              {activeTab === i && !paused && (
                <span
                  key={current}
                  className="absolute bottom-0 left-0 h-[2px] bg-white/40 rounded-full"
                  style={{ animation: `tabProgress ${SLIDE_INTERVAL}ms linear forwards` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Carrossel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div
                className="relative rounded-2xl overflow-hidden border border-white/8 bg-bg"
                style={{ maxWidth: "480px", width: "100%" }}
              >
                <img
                  src={ALL_SLIDES[current].imgSrc}
                  alt={`${CATEGORIAS[activeTab].label} - depoimento`}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "600px" }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg/60 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Setas */}
          <button
            onClick={() => { go(current - 1); setPaused(true) }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent/40 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => { go(current + 1); setPaused(true) }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent/40 transition-all"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots — um por imagem */}
          <div className="flex justify-center gap-1.5 mt-5 flex-wrap">
            {ALL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { go(i); setPaused(true) }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 h-1.5 bg-accent"
                    : ALL_SLIDES[i].tabIdx === activeTab
                    ? "w-1.5 h-1.5 bg-white/30"
                    : "w-1.5 h-1.5 bg-white/12 hover:bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes tabProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  )
}
