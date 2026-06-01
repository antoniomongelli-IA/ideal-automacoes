"use client"
import { motion } from "framer-motion"

interface SectionTitleProps {
  title: string
  subtitle?: string
  center?: boolean
}

export function SectionTitle({ title, subtitle, center = true }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${center ? "text-center" : ""}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  )
}
