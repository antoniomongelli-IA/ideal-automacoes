"use client"
import { useRef, useState } from "react"

export function useTilt(maxDeg = 10) {
  const ref = useRef<HTMLElement>(null)
  const [style, setStyle] = useState({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
    transition: "transform 0.15s ease-out",
  })

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  // 0–1
    const y = (e.clientY - rect.top) / rect.height   // 0–1
    const rotY = (x - 0.5) * maxDeg * 2
    const rotX = -(y - 0.5) * maxDeg * 2
    setStyle({
      transform: `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`,
      transition: "transform 0.1s ease-out",
    })
  }

  const onMouseLeave = () => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s ease-out",
    })
  }

  return { ref, style, onMouseMove, onMouseLeave }
}
