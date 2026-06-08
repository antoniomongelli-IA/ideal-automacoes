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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`mb-12 ${center ? "text-center" : ""}`}
    >
      {/* Eyebrow line */}
      <motion.div
        variants={{
          hidden: { scaleX: 0, opacity: 0 },
          visible: { scaleX: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
        }}
        className="mb-4"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #A020F0 40%, #CC44FF 60%, transparent)",
          transformOrigin: center ? "center" : "left",
          maxWidth: center ? "160px" : "120px",
          ...(center ? { margin: "0 auto 16px" } : { marginBottom: "16px" }),
        }}
      />

      {/* Title clip reveal */}
      <div style={{ overflow: "hidden", paddingBottom: "6px" }}>
        <motion.h2
          variants={{
            hidden: { y: "105%", opacity: 0 },
            visible: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 } },
          }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary"
        >
          {title}
        </motion.h2>
      </div>

      {/* Underline sweep */}
      <motion.div
        variants={{
          hidden: { scaleX: 0, opacity: 0 },
          visible: { scaleX: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.45 } },
        }}
        style={{
          height: "2px",
          background: "linear-gradient(90deg, #A020F0, #CC44FF 50%, transparent)",
          transformOrigin: center ? "center" : "left",
          maxWidth: center ? "280px" : "200px",
          borderRadius: "2px",
          ...(center ? { margin: "12px auto 0" } : { marginTop: "12px" }),
        }}
      />

      {subtitle && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.55 } },
          }}
          className="text-text-muted text-lg max-w-2xl mx-auto mt-5"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
