"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GlowCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function GlowCard({ children, className = "", delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: "rgba(160,32,240,0.6)", boxShadow: "0 0 30px rgba(160,32,240,0.2), 0 8px 32px rgba(0,0,0,0.4)", y: -4 }}
      className={`relative bg-surface border border-white/5 rounded-2xl p-6 transition-colors duration-300 overflow-hidden ${className}`}
    >
      {/* Shimmer sweep on entrance */}
      <motion.div
        initial={{ x: "-100%", opacity: 0.6 }}
        whileInView={{ x: "200%", opacity: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: delay + 0.1, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(160,32,240,0.12) 50%, transparent 60%)",
          zIndex: 1,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
