"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GradientButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "outline"
  className?: string
}

export function GradientButton({ children, onClick, href, variant = "primary", className = "" }: GradientButtonProps) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer"
  const primary = "bg-brand-gradient text-white shadow-[0_0_20px_rgba(160,32,240,0.4)] hover:shadow-[0_0_35px_rgba(160,32,240,0.7)] hover:scale-105"
  const outline = "border border-accent text-accent hover:bg-accent/10 hover:shadow-[0_0_20px_rgba(160,32,240,0.3)]"

  const classes = `${base} ${variant === "primary" ? primary : outline} ${className}`

  if (href) {
    return (
      <motion.a href={href} className={classes} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button onClick={onClick} className={classes} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  )
}
