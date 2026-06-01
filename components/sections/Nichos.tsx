"use client"
import { Building2, Stethoscope, Heart, ShoppingCart, GraduationCap, Scale, Hotel, Megaphone, Briefcase, Wrench, Scissors, Car, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { SectionTitle } from "@/components/ui/SectionTitle"
import { NICHES } from "@/lib/constants"

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Stethoscope, Heart, ShoppingCart, GraduationCap, Scale, Hotel, Megaphone, Briefcase, Wrench, Scissors, Car,
}

export function Nichos() {
  return (
    <section id="nichos" className="py-24 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <SectionTitle title="Atendemos empresas de diversos segmentos" />

        <div className="flex flex-wrap justify-center gap-3">
          {NICHES.map((niche, i) => {
            const Icon = ICON_MAP[niche.icon]
            return (
              <motion.div
                key={niche.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg border border-white/10 text-text-muted text-sm hover:border-accent/40 hover:text-accent transition-all duration-300"
              >
                <Icon size={15} />
                {niche.label}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
