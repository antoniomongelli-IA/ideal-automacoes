"use client"
import { useEffect, useRef } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let frame: number

    document.body.style.cursor = "none"

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onEnterLink = () => {
      ring.style.transform = "scale(1.7)"
      ring.style.borderColor = "rgba(160,32,240,0.9)"
      dot.style.transform = "scale(0.3)"
    }

    const onLeaveLink = () => {
      ring.style.transform = "scale(1)"
      ring.style.borderColor = "rgba(160,32,240,0.5)"
      dot.style.transform = "scale(1)"
    }

    const attachListeners = () => {
      document.querySelectorAll("a, button, [role='button'], input, select, textarea").forEach((el) => {
        el.addEventListener("mouseenter", onEnterLink)
        el.addEventListener("mouseleave", onLeaveLink)
      })
    }
    attachListeners()

    const loop = () => {
      dot.style.left = `${mouseX}px`
      dot.style.top = `${mouseY}px`

      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`

      frame = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener("mousemove", onMove)
    return () => {
      document.body.style.cursor = ""
      cancelAnimationFrame(frame)
      window.removeEventListener("mousemove", onMove)
    }
  }, [])

  return (
    <>
      {/* Dot — centrado via margin negativo */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: "6px",
          height: "6px",
          marginLeft: "-3px",
          marginTop: "-3px",
          borderRadius: "50%",
          background: "#CC44FF",
          boxShadow: "0 0 8px rgba(204,68,255,0.9)",
          transition: "transform 0.15s ease",
        }}
      />
      {/* Ring — centrado via margin negativo */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9998]"
        style={{
          width: "32px",
          height: "32px",
          marginLeft: "-16px",
          marginTop: "-16px",
          borderRadius: "50%",
          border: "1.5px solid rgba(160,32,240,0.5)",
          transition: "transform 0.25s ease, border-color 0.2s ease",
        }}
      />
    </>
  )
}
