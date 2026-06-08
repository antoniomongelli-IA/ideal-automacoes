"use client"

const PROBLEMS = [
  {
    text: "Atendimento lento que perde clientes para a concorrência",
    question: "Quanto você perde por dia enquanto o cliente espera resposta?",
  },
  {
    text: "Leads que somem sem follow-up e nunca convertem",
    question: "Quantos leads você deixou escapar esse mês por falta de retorno?",
  },
  {
    text: "Equipe afogada em tarefas repetitivas que não geram valor",
    question: "Quantas horas por semana sua equipe gasta em tarefas que um robô faria?",
  },
  {
    text: "Processos que travam quando uma pessoa falta ou sai",
    question: "Seu negócio depende de uma pessoa para não parar?",
  },
]

export function Problema() {
  return (
    <section id="problema" className="py-24 px-6 bg-surface section-edge-glow">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight max-w-lg">
            Você ainda perde tempo e dinheiro com isso?
          </h2>
          <p className="text-text-muted text-base max-w-sm leading-relaxed md:text-right">
            Esses problemas custam clientes, receita e crescimento todo dia.
          </p>
        </div>

        <div className="flex flex-col">
          {PROBLEMS.map((p, i) => (
            <div
              key={i}
              className="group grid grid-cols-1 md:grid-cols-[80px_1fr_2fr] gap-3 md:gap-10 py-6 md:py-8 border-t border-white/8 hover:border-accent/20 transition-colors duration-300 items-start"
            >
              <span
                className="text-5xl font-bold leading-none select-none hidden md:block transition-colors duration-300"
                style={{ color: "rgba(160,32,240,0.15)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-text-primary font-semibold text-base leading-snug group-hover:text-white transition-colors duration-300">
                {p.text}
              </p>
              <p className="text-text-primary text-sm leading-relaxed italic self-start px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/8">
                {p.question}
              </p>
            </div>
          ))}
          <div className="border-t border-white/8" />
        </div>

      </div>
    </section>
  )
}
