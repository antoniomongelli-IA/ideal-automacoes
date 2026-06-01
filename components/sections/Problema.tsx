"use client"
import { Clock, UserX, RefreshCw, AlertTriangle } from "lucide-react"
import { GlowCard } from "@/components/ui/GlowCard"
import { SectionTitle } from "@/components/ui/SectionTitle"

const PROBLEMS = [
  {
    icon: Clock,
    text: "Atendimento lento que perde clientes para a concorrência",
  },
  {
    icon: UserX,
    text: "Leads que somem sem follow-up e nunca convertem",
  },
  {
    icon: RefreshCw,
    text: "Equipe afogada em tarefas repetitivas que não geram valor",
  },
  {
    icon: AlertTriangle,
    text: "Processos que travam quando uma pessoa falta ou sai",
  },
]

export function Problema() {
  return (
    <section id="problema" className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Você ainda perde tempo e dinheiro com isso?" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEMS.map((problem, i) => (
            <GlowCard key={i} delay={i * 0.1}>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <problem.icon size={24} className="text-accent" />
              </div>
              <p className="text-text-primary font-medium leading-snug">{problem.text}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
