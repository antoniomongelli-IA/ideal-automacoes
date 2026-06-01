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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ borderColor: "var(--accent)", boxShadow: "0 0 25px rgba(160,32,240,0.25)" }}
      className={`bg-surface border border-white/5 rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}
