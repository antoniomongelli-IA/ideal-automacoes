"use client"

const GARANTIAS = [
  {
    num: "01",
    label: "Antes de qualquer cobrança",
    title: "Diagnóstico gratuito e sem compromisso",
    desc: "Mapeamos seus processos, identificamos gargalos e mostramos exatamente onde a automação vai gerar retorno. Você sai com clareza total, sem nenhuma obrigação de continuar.",
  },
  {
    num: "02",
    label: "No ar em até 2 semanas",
    title: "Resultado antes de qualquer renovação",
    desc: "A primeira automação entra em produção em até 2 semanas. Se não entregar o resultado acordado, ajustamos sem custo até funcionar. Não cobramos por tentativa.",
  },
  {
    num: "03",
    label: "Sem fidelidade",
    title: "Você pode cancelar quando quiser",
    desc: "Trabalhamos mês a mês. Nenhum contrato de longo prazo, nenhuma multa. Ficamos porque entregamos resultado, não porque você assinou um papel.",
  },
  {
    num: "04",
    label: "Depois da entrega",
    title: "2 semanas de suporte incluso",
    desc: "Após a entrega, estamos ao lado para ajustar, treinar sua equipe e garantir que tudo funcione como prometido. Sem cobranças extras nas primeiras 2 semanas.",
  },
]

export function Garantia() {
  return (
    <section id="garantia" className="py-24 px-6 bg-bg section-edge-glow">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight max-w-lg">
            Você não arrisca nada para descobrir se funciona
          </h2>
          <p className="text-text-muted text-base max-w-sm leading-relaxed md:text-right">
            PME não tem margem para aposta. Por isso estruturamos cada projeto assim:
          </p>
        </div>

        {/* Lista de garantias */}
        <div className="flex flex-col">
          {GARANTIAS.map((g) => (
            <div
              key={g.num}
              className="group grid grid-cols-1 md:grid-cols-[80px_1fr_2fr] gap-3 md:gap-10 py-6 md:py-8 border-t border-white/8 hover:border-accent/20 transition-colors duration-300 items-start"
            >
              <span
                className="text-5xl font-bold leading-none select-none hidden md:block"
                style={{ color: "rgba(160,32,240,0.15)", transition: "color 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(160,32,240,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(160,32,240,0.15)")}
              >
                {g.num}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-accent/80 font-medium uppercase tracking-widest">{g.label}</span>
                <p className="text-text-primary font-semibold text-base leading-snug group-hover:text-white transition-colors duration-300">{g.title}</p>
              </div>
              <p className="text-text-primary text-sm leading-relaxed italic self-start px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/8">{g.desc}</p>
            </div>
          ))}
          <div className="border-t border-white/8" />
        </div>

        {/* Âncora de preço + CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-text-muted text-sm">
            Investimento sob medida:{" "}
            <span className="text-text-primary font-medium">cabe no bolso de quem quer crescer.</span>
          </p>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Quero meu diagnóstico gratuito
            </a>
            <p className="text-text-muted text-xs">Sem ligações. Resposta em até 5 minutos.</p>
          </div>
        </div>

      </div>
    </section>
  )
}
