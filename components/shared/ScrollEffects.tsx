"use client"
import { useEffect } from "react"

export function ScrollEffects() {
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]")

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Remove e re-adiciona para re-disparar a animação do scan line
            entry.target.classList.remove("section-revealed")
            void (entry.target as HTMLElement).offsetWidth // force reflow
            entry.target.classList.add("section-revealed")
          }
        })
      },
      { threshold: 0.08 }
    )

    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return null
}
