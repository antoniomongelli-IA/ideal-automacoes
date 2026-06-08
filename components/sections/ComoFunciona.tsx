"use client"
import { useEffect, useRef, useState } from "react"
import { HOW_IT_WORKS } from "@/lib/constants"

export function ComoFunciona() {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(i)
        },
        { threshold: 0.5, rootMargin: "-20% 0px -30% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const step = HOW_IT_WORKS[activeStep]

  return (
    <section id="como-funciona" className="bg-bg">
      {/* Mobile: stacked cards */}
      <div className="md:hidden py-20 px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Como funciona</h2>
          <p className="text-text-muted">Um processo claro, do diagnóstico ao resultado</p>
        </div>
        <div className="flex flex-col gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <div
              key={s.step}
              className="relative rounded-2xl border border-white/8 bg-surface overflow-hidden px-6 py-10"
            >
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[120px] font-bold leading-none text-white/[0.04] select-none">
                {s.step}
              </span>
              <span className="text-xs text-accent font-semibold uppercase tracking-widest mb-4 block">{s.tag}</span>
              <h3 className="text-2xl font-bold text-text-primary mb-3">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: sticky scroll */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="px-16 pt-24 pb-0 max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4 max-w-2xl">
            Como{" "}
            <span className="text-accent">funciona</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl">
            Um processo claro e previsível, do diagnóstico ao resultado.
          </p>
        </div>

        {/* Sticky layout */}
        <div className="relative max-w-7xl mx-auto px-16 pb-32">
          <div className="flex gap-16 items-start">
            {/* Left: sticky image panel */}
            <div className="w-[52%] sticky top-24 self-start">
              <div
                className="relative rounded-2xl overflow-hidden bg-surface border border-white/8"
                style={{ aspectRatio: "16/10" }}
              >
                <img
                  key={activeStep}
                  src={step.image}
                  alt={step.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
                />

                {/* Step overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <span className="text-xs text-accent font-semibold uppercase tracking-widest block mb-2 transition-all duration-500">
                    {step.tag}
                  </span>
                  <h3
                    className="text-2xl font-bold text-white transition-all duration-500"
                    key={activeStep}
                    style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
                  >
                    {step.step}. {step.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Right: scrollable steps */}
            <div className="w-[48%] pt-24">
              <ul className="flex flex-col gap-0">
                {HOW_IT_WORKS.map((s, i) => (
                  <li
                    key={s.step}
                    ref={(el) => { stepRefs.current[i] = el }}
                    className="relative flex flex-col gap-5 overflow-hidden border-b border-white/6 py-16 pl-6 transition-all duration-500"
                    style={{ opacity: activeStep === i ? 1 : 0.35 }}
                  >
                    {/* Ghost number */}
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-bold leading-none select-none"
                      style={{
                        fontSize: "180px",
                        letterSpacing: "-6px",
                        color: activeStep === i ? "rgba(160,32,240,0.18)" : "rgba(255,255,255,0.05)",
                        transition: "color 0.5s",
                      }}
                    >
                      {s.step}
                    </span>

                    <span
                      className="text-xs font-semibold uppercase tracking-widest transition-colors duration-500"
                      style={{ color: activeStep === i ? "#A020F0" : "rgba(255,255,255,0.3)" }}
                    >
                      {s.tag}
                    </span>

                    <h3
                      className="relative text-3xl font-bold transition-colors duration-500"
                      style={{ color: activeStep === i ? "#F4F0FF" : "rgba(244,240,255,0.5)" }}
                    >
                      {s.step}. {s.title}
                    </h3>

                    <p
                      className="relative text-base leading-relaxed max-w-md transition-colors duration-500"
                      style={{ color: activeStep === i ? "#8B80A8" : "rgba(139,128,168,0.4)" }}
                    >
                      {s.description}
                    </p>

                    {activeStep === i && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                        style={{ background: "linear-gradient(180deg, #A020F0, #6B21F5)" }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
