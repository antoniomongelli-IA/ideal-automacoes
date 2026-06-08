"use client"
import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  pulse: number
  pulseSpeed: number
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    let animFrame: number
    const nodes: Node[] = []
    const NODE_COUNT = 90
    const CONNECTION_DIST = 200
    const MOUSE = { x: -9999, y: -9999 }

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      MOUSE.x = e.clientX - rect.left
      MOUSE.y = e.clientY - rect.top
    }
    window.addEventListener("mousemove", onMouseMove)

    const draw = () => {
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)

      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        n.pulse += n.pulseSpeed
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1

        // Mouse repulsion
        const dx = n.x - MOUSE.x, dy = n.y - MOUSE.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          n.vx += (dx / d) * 0.3
          n.vy += (dy / d) * 0.3
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
          if (speed > 2) { n.vx /= speed * 0.7; n.vy /= speed * 0.7 }
        }
      })

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.75
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(180,60,255,${alpha})`
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        const pulse = (Math.sin(n.pulse) + 1) / 2
        const r = 2 + pulse * 1.5

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
        grd.addColorStop(0, `rgba(160,32,240,${0.45 + pulse * 0.3})`)
        grd.addColorStop(1, "rgba(160,32,240,0)")
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,160,255,${0.85 + pulse * 0.15})`
        ctx.fill()
      })

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-90"
      style={{ pointerEvents: "none" }}
    />
  )
}
