export const metadata = {
  title: "Ideal Automações — Apresentação para Corretores Autônomos",
}

const slides = [
  {
    type: "cover",
    label: "Automação & IA",
    title: "Sua corretora no\npiloto automático",
    subtitle: "Como corretores autônomos estão respondendo leads em segundos, agendando visitas sem esforço e fechando mais negócios — sem contratar ninguém.",
    footer: "idealautomacoes.com.br · Campo Grande, MS",
  },
  {
    type: "problem",
    label: "O problema",
    title: "A realidade do corretor autônomo hoje",
    items: [
      { icon: "⏱", text: "Você responde lead manualmente, um por um, no WhatsApp" },
      { icon: "👻", text: "Cliente pediu proposta, sumiu — sem retorno automático" },
      { icon: "📅", text: "Agenda desorganizada, visitas que não aparecem" },
      { icon: "😤", text: "Concorrente respondeu mais rápido e fechou o negócio que seria seu" },
      { icon: "🧍", text: "Trabalha sozinho mas precisa produzir como uma equipe" },
    ],
    highlight: "A automação resolve exatamente isso — sem contratar ninguém.",
  },
  {
    type: "solution",
    label: "O que fazemos",
    title: "Seu assistente de IA no WhatsApp",
    subtitle: "Criamos um agente de IA personalizado para a sua corretora que:",
    items: [
      { icon: "🕐", text: "Responde leads 24h por dia, 7 dias por semana — mesmo enquanto você dorme" },
      { icon: "🎯", text: "Qualifica clientes automaticamente: renda, intenção, prazo de compra" },
      { icon: "🏠", text: "Envia imóveis, fotos e informações pelo WhatsApp sem você estar online" },
      { icon: "🔄", text: "Faz follow-up automático de quem pediu proposta e sumiu" },
      { icon: "📆", text: "Agenda visitas direto no seu calendário sem troca de mensagem" },
    ],
  },
  {
    type: "how",
    label: "Como funciona",
    title: "Do diagnóstico ao resultado em 30 dias",
    steps: [
      { num: "01", title: "Diagnóstico gratuito", desc: "Mapeamos como você recebe e atende leads hoje. Identificamos onde você perde tempo e clientes. Sem custo, sem compromisso." },
      { num: "02", title: "Implementação", desc: "Criamos seu assistente de IA integrado ao seu WhatsApp, catálogo de imóveis e agenda. Você não precisa entender de tecnologia." },
      { num: "03", title: "Piloto automático", desc: "Seu assistente responde, qualifica e agenda. Você só entra quando o cliente já está pronto para visitar ou assinar." },
    ],
  },
  {
    type: "results",
    label: "Resultados",
    title: "O que muda na prática",
    metrics: [
      { value: "< 1 min", label: "Tempo de resposta para leads", before: "horas de espera" },
      { value: "–80%", label: "Leads que somem sem retorno", before: "follow-up manual" },
      { value: "24h", label: "Atendimento ativo", before: "só no horário comercial" },
      { value: "30 dias", label: "Para ver resultado", before: "meses de implementação" },
    ],
  },
  {
    type: "cases",
    label: "Cases",
    title: "Resultados reais de clientes reais",
    cases: [
      { company: "Care Mais Saúde", niche: "Home Care", result: "Tempo de resposta de 2h para menos de 1 minuto com agente de IA no WhatsApp" },
      { company: "Kabana's Flores", niche: "Floricultura", result: "Redução de 80% no tempo de resposta e aumento de pedidos recorrentes" },
      { company: "Vila da Mônica", niche: "Turismo / Parque", result: "Atendente virtual com agendamento automático — equipe focada só em casos complexos" },
      { company: "eLAV Lavanderia", niche: "Serviços", result: "Zero falhas de comunicação com clientes — notificações 100% automáticas" },
    ],
  },
  {
    type: "founder",
    label: "Quem somos",
    title: "Antônio Mongelli",
    role: "Fundador & Especialista em IA e Automação",
    location: "📍 Campo Grande, MS",
    bio: "23 anos, 5 na área de tecnologia — os últimos focados exclusivamente em automação e IA para negócios. Já entreguei mais de 50 automações em 11 estados diferentes, de lavanderias em Belém a parques temáticos em Gramado.",
    quote: "\"Comecei automatizando meu próprio negócio e vi o resultado na prática. Aí decidi fazer isso para todo mundo.\"",
    stats: [
      { value: "23", label: "anos" },
      { value: "5", label: "anos em tech" },
      { value: "+50", label: "automações" },
      { value: "11", label: "estados" },
    ],
  },
  {
    type: "guarantee",
    label: "Garantias",
    title: "Risco zero para você",
    subtitle: "Corretor autônomo não tem margem para apostar. Por isso:",
    items: [
      { icon: "🛡", text: "Diagnóstico 100% gratuito e sem compromisso" },
      { icon: "⚡", text: "Primeira automação no ar em até 30 dias" },
      { icon: "🔁", text: "Resultado no prazo ou ajustamos sem custo adicional" },
      { icon: "📅", text: "Sem contrato de longo prazo — mês a mês" },
      { icon: "🤝", text: "Suporte incluso no primeiro mês" },
      { icon: "💰", text: "Investimento sob medida — cabe no bolso de quem quer crescer" },
    ],
  },
  {
    type: "faq",
    label: "Dúvidas frequentes",
    title: "O que todo corretor pergunta antes de começar",
    faqs: [
      { q: "Preciso de sistema próprio?", a: "Não. Funcionamos com o WhatsApp que você já usa." },
      { q: "Funciona para corretor solo?", a: "É exatamente para esse perfil que mais faz diferença — você ganha escala sem contratar." },
      { q: "Meu número do WhatsApp fica travado?", a: "Não. Usamos API oficial — você mantém controle total e pode assumir a conversa quando quiser." },
      { q: "Quanto custa?", a: "Sob medida. O diagnóstico é gratuito e sem compromisso. Apresentamos proposta clara após entender seu negócio." },
    ],
  },
  {
    type: "cta",
    label: "Próximo passo",
    title: "Agende seu diagnóstico gratuito",
    subtitle: "Sem ligações de vendas. Sem pressão. Resposta em até 5 minutos.",
    contacts: [
      { icon: "📱", label: "WhatsApp", value: "(67) 99632-9837", link: "https://wa.me/5567996329837" },
      { icon: "📧", label: "E-mail", value: "contato.ideaalautomacoes@gmail.com", link: "mailto:contato.ideaalautomacoes@gmail.com" },
      { icon: "📸", label: "Instagram", value: "@ideal.automacoes", link: "https://instagram.com/ideal.automacoes" },
      { icon: "🌐", label: "Site", value: "idealautomacoes.com.br", link: "https://idealautomacoes.com.br" },
    ],
  },
]

function SlideWrapper({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`slide ${accent ? "slide-accent" : ""}`}>
      {children}
    </div>
  )
}

function Label({ text }: { text: string }) {
  return <span className="label">{text}</span>
}

export default function ApresentacaoCorretores() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #08070F;
          --surface: #110F1E;
          --accent: #A020F0;
          --accent-light: #CC44FF;
          --text: #F4F0FF;
          --muted: #9B90BB;
          --border: rgba(255,255,255,0.08);
        }

        body {
          font-family: 'Inter', sans-serif;
          background: #1a1a2e;
          color: var(--text);
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page-hint {
          text-align: center;
          padding: 24px;
          color: #888;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .page-hint button {
          background: #A020F0;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .slides {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-width: 1123px;
          margin: 0 auto;
        }

        .slide {
          width: 1123px;
          min-height: 632px;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 56px 64px;
          page-break-after: always;
          break-after: page;
          border-bottom: 1px solid #222;
        }

        .slide::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), var(--accent-light));
        }

        .slide-accent {
          background: linear-gradient(135deg, #0D0920 0%, #1A0A35 50%, #0D0920 100%);
        }

        .slide-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(160,32,240,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .label {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 999px;
          border: 1px solid rgba(160,32,240,0.4);
          background: rgba(160,32,240,0.1);
          color: var(--accent-light);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        h1 { font-size: 52px; font-weight: 900; line-height: 1.05; color: var(--text); white-space: pre-line; }
        h2 { font-size: 36px; font-weight: 800; line-height: 1.1; color: var(--text); }
        h3 { font-size: 18px; font-weight: 700; color: var(--text); }
        p  { font-size: 15px; color: var(--muted); line-height: 1.6; }

        .accent { color: var(--accent-light); }
        .bold { font-weight: 700; color: var(--text); }

        /* Cover */
        .cover-layout { display: flex; flex-direction: column; justify-content: center; height: 100%; gap: 24px; }
        .cover-layout h1 { font-size: 58px; }
        .cover-subtitle { font-size: 17px; color: var(--muted); max-width: 640px; line-height: 1.7; }
        .cover-footer { margin-top: auto; font-size: 13px; color: rgba(255,255,255,0.2); }
        .cover-badge { font-size: 13px; font-weight: 600; color: var(--accent-light); background: rgba(160,32,240,0.12); border: 1px solid rgba(160,32,240,0.25); padding: 6px 16px; border-radius: 999px; display: inline-block; margin-bottom: 8px; }

        /* Items list */
        .items-list { display: flex; flex-direction: column; gap: 14px; margin-top: 24px; }
        .item-row { display: flex; align-items: flex-start; gap: 14px; }
        .item-icon { font-size: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(160,32,240,0.1); border-radius: 10px; flex-shrink: 0; }
        .item-text { font-size: 15px; color: var(--muted); padding-top: 7px; line-height: 1.5; }
        .item-text strong { color: var(--text); }

        .highlight-box { margin-top: 28px; padding: 16px 20px; border-radius: 12px; background: rgba(160,32,240,0.08); border: 1px solid rgba(160,32,240,0.25); font-size: 15px; font-weight: 600; color: var(--accent-light); }

        /* How it works */
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
        .step-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; position: relative; }
        .step-num { font-size: 40px; font-weight: 900; color: rgba(160,32,240,0.2); line-height: 1; margin-bottom: 12px; }
        .step-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* Metrics */
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 32px; }
        .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px 20px; }
        .metric-value { font-size: 36px; font-weight: 900; color: var(--accent-light); line-height: 1; margin-bottom: 6px; }
        .metric-label { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .metric-before { font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
        .metric-before::before { content: 'antes: '; }

        /* Cases */
        .cases-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 28px; }
        .case-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .case-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .case-company { font-size: 15px; font-weight: 700; color: var(--text); }
        .case-niche { font-size: 11px; color: var(--accent-light); background: rgba(160,32,240,0.1); padding: 3px 10px; border-radius: 999px; }
        .case-result { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .case-result::before { content: '✓ '; color: var(--accent-light); font-weight: 700; }

        /* Founder */
        .founder-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; height: 100%; }
        .founder-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 24px; }
        .founder-stat { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; padding: 16px 12px; text-align: center; }
        .founder-stat-value { font-size: 24px; font-weight: 800; color: var(--accent-light); }
        .founder-stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .founder-quote { margin-top: 24px; padding: 16px 20px; border-left: 3px solid rgba(160,32,240,0.5); font-style: italic; color: var(--muted); font-size: 14px; line-height: 1.7; }
        .photo-placeholder { width: 100%; aspect-ratio: 3/4; background: linear-gradient(135deg, #1A0A35, #0D0920); border-radius: 20px; border: 1px solid rgba(160,32,240,0.2); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); font-size: 13px; }
        .photo-img { width: 100%; aspect-ratio: 3/4; object-fit: cover; object-position: center 20%; border-radius: 20px; border: 1px solid rgba(160,32,240,0.3); }

        /* Guarantee */
        .guarantee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 28px; }
        .guarantee-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; display: flex; align-items: flex-start; gap: 12px; }
        .guarantee-icon { font-size: 20px; flex-shrink: 0; }
        .guarantee-text { font-size: 13px; color: var(--muted); line-height: 1.5; }

        /* FAQ */
        .faq-list { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }
        .faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 22px; }
        .faq-q { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .faq-a { font-size: 13px; color: var(--muted); line-height: 1.5; }

        /* CTA */
        .cta-layout { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; gap: 32px; }
        .cta-layout h2 { font-size: 44px; }
        .contacts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; width: 100%; max-width: 600px; }
        .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
        .contact-icon { font-size: 22px; }
        .contact-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .contact-value { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 2px; }
        .cta-sub { font-size: 15px; color: var(--muted); }

        /* Two-col layout */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }

        @media print {
          body { background: var(--bg); }
          .page-hint { display: none; }
          .slide { border-bottom: none; }
        }
      `}</style>

      <div className="page-hint" style={{ background: "#0f0f1a", color: "#888", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <span>Para salvar como PDF: pressione</span>
        <kbd style={{ background: "#222", color: "#ccc", padding: "4px 10px", borderRadius: "6px", fontFamily: "monospace" }}>Ctrl+P</kbd>
        <span>→ Destino: <strong style={{ color: "#ccc" }}>Salvar como PDF</strong> → Sem margens</span>
      </div>

      <div className="slides">

        {/* Slide 1 — Cover */}
        <div className="slide slide-accent">
          <div className="slide-glow" />
          <div className="cover-layout">
            <div>
              <div className="cover-badge">✦ Ideal Automações</div>
              <h1 style={{ whiteSpace: "pre-line" }}>{"Sua corretora no\npiloto automático"}</h1>
            </div>
            <p className="cover-subtitle">
              Como corretores autônomos estão respondendo leads em segundos, agendando visitas sem esforço e fechando mais negócios — sem contratar ninguém.
            </p>
            <div className="cover-footer">idealautomacoes.com.br · Campo Grande, MS · (67) 99632-9837</div>
          </div>
        </div>

        {/* Slide 2 — Problema */}
        <div className="slide">
          <Label text="O problema" />
          <h2>A realidade do corretor autônomo hoje</h2>
          <div className="items-list">
            {[
              { icon: "⏱", text: "Você responde lead <strong>manualmente, um por um</strong>, no WhatsApp" },
              { icon: "👻", text: "Cliente pediu proposta, sumiu — <strong>sem retorno automático</strong>" },
              { icon: "📅", text: "Agenda desorganizada, <strong>visitas que não aparecem</strong>" },
              { icon: "😤", text: "Concorrente respondeu mais rápido e <strong>fechou o negócio que seria seu</strong>" },
              { icon: "🧍", text: "Trabalha sozinho mas precisa <strong>produzir como uma equipe</strong>" },
            ].map((item, i) => (
              <div key={i} className="item-row">
                <div className="item-icon">{item.icon}</div>
                <div className="item-text" dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
          <div className="highlight-box">A automação resolve exatamente isso — sem contratar ninguém.</div>
        </div>

        {/* Slide 3 — Solução */}
        <div className="slide">
          <Label text="O que fazemos" />
          <h2>Seu assistente de IA no WhatsApp</h2>
          <p style={{ marginTop: 8 }}>Criamos um agente de IA personalizado para a sua corretora que:</p>
          <div className="items-list" style={{ marginTop: 20 }}>
            {[
              { icon: "🕐", text: "Responde leads <strong>24h por dia, 7 dias por semana</strong> — mesmo enquanto você dorme" },
              { icon: "🎯", text: "<strong>Qualifica clientes automaticamente</strong>: renda, intenção, prazo de compra" },
              { icon: "🏠", text: "Envia imóveis, fotos e informações pelo WhatsApp <strong>sem você estar online</strong>" },
              { icon: "🔄", text: "<strong>Follow-up automático</strong> de quem pediu proposta e sumiu" },
              { icon: "📆", text: "<strong>Agenda visitas</strong> direto no seu calendário sem troca de mensagem" },
            ].map((item, i) => (
              <div key={i} className="item-row">
                <div className="item-icon">{item.icon}</div>
                <div className="item-text" dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
        </div>

        {/* Slide 4 — Como funciona */}
        <div className="slide">
          <Label text="Como funciona" />
          <h2>Do diagnóstico ao resultado em 30 dias</h2>
          <div className="steps">
            {[
              { num: "01", title: "Diagnóstico gratuito", desc: "Mapeamos como você recebe e atende leads hoje. Identificamos onde você perde tempo e clientes. Sem custo, sem compromisso." },
              { num: "02", title: "Implementação", desc: "Criamos seu assistente de IA integrado ao seu WhatsApp, catálogo de imóveis e agenda. Você não precisa entender de tecnologia." },
              { num: "03", title: "Piloto automático", desc: "Seu assistente responde, qualifica e agenda. Você só entra quando o cliente está pronto para visitar ou assinar." },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.num}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 5 — Resultados */}
        <div className="slide slide-accent">
          <div className="slide-glow" />
          <Label text="Resultados" />
          <h2>O que muda na prática</h2>
          <div className="metrics">
            {[
              { value: "< 1 min", label: "Resposta para leads", before: "horas de espera" },
              { value: "–80%", label: "Leads sem retorno", before: "follow-up manual" },
              { value: "24h", label: "Atendimento ativo", before: "só horário comercial" },
              { value: "30 dias", label: "Para ver resultado", before: "meses de implementação" },
            ].map((m, i) => (
              <div key={i} className="metric-card">
                <div className="metric-value">{m.value}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-before">{m.before}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 6 — Cases */}
        <div className="slide">
          <Label text="Cases" />
          <h2>Resultados reais de clientes reais</h2>
          <div className="cases-grid">
            {[
              { company: "Care Mais Saúde", niche: "Home Care", result: "Tempo de resposta de 2h para menos de 1 minuto com agente de IA no WhatsApp" },
              { company: "Kabana's Flores", niche: "Floricultura", result: "Redução de 80% no tempo de resposta e aumento de pedidos recorrentes" },
              { company: "Vila da Mônica", niche: "Parque Temático", result: "Atendente virtual com agendamento automático — equipe focada só em casos complexos" },
              { company: "eLAV Lavanderia", niche: "Serviços", result: "Zero falhas de comunicação com clientes — notificações 100% automáticas" },
            ].map((c, i) => (
              <div key={i} className="case-card">
                <div className="case-header">
                  <div className="case-company">{c.company}</div>
                  <div className="case-niche">{c.niche}</div>
                </div>
                <div className="case-result">{c.result}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 7 — Fundador */}
        <div className="slide">
          <div className="founder-layout">
            <div>
              <Label text="Quem somos" />
              <h2>Antônio Mongelli</h2>
              <p style={{ color: "#A020F0", fontWeight: 600, marginTop: 4 }}>Fundador & Especialista em IA e Automação</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>📍 Campo Grande, MS</p>
              <p style={{ marginTop: 16, fontSize: 14 }}>
                23 anos, 5 na área de tecnologia — os últimos focados exclusivamente em automação e IA para negócios. Já entreguei mais de 50 automações em 11 estados diferentes, de lavanderias em Belém a parques temáticos em Gramado.
              </p>
              <div className="founder-quote">
                "Comecei automatizando meu próprio negócio e vi o resultado na prática. Aí decidi fazer isso para todo mundo."
              </div>
              <div className="founder-stats">
                {[
                  { value: "23", label: "anos" },
                  { value: "5", label: "em tech" },
                  { value: "+50", label: "automações" },
                  { value: "11", label: "estados" },
                ].map((s, i) => (
                  <div key={i} className="founder-stat">
                    <div className="founder-stat-value">{s.value}</div>
                    <div className="founder-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/antonio.jpg" alt="Antônio Mongelli" className="photo-img" />
            </div>
          </div>
        </div>

        {/* Slide 8 — Garantias */}
        <div className="slide slide-accent">
          <div className="slide-glow" />
          <Label text="Garantias" />
          <h2>Risco zero para você</h2>
          <p style={{ marginTop: 8 }}>Corretor autônomo não tem margem para apostar. Por isso:</p>
          <div className="guarantee-grid">
            {[
              { icon: "🛡", text: "Diagnóstico 100% gratuito e sem compromisso" },
              { icon: "⚡", text: "Primeira automação no ar em até 30 dias" },
              { icon: "🔁", text: "Resultado no prazo ou ajustamos sem custo" },
              { icon: "📅", text: "Sem contrato de longo prazo — mês a mês" },
              { icon: "🤝", text: "Suporte incluso no primeiro mês" },
              { icon: "💰", text: "Investimento sob medida — cabe no bolso de quem quer crescer" },
            ].map((g, i) => (
              <div key={i} className="guarantee-item">
                <div className="guarantee-icon">{g.icon}</div>
                <div className="guarantee-text">{g.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 9 — FAQ */}
        <div className="slide">
          <Label text="Dúvidas frequentes" />
          <h2>O que todo corretor pergunta antes de começar</h2>
          <div className="faq-list">
            {[
              { q: "Preciso de sistema próprio ou de equipe técnica?", a: "Não. Funcionamos com o WhatsApp que você já usa. Não precisa entender de tecnologia para usar." },
              { q: "Funciona para corretor solo, com poucos clientes?", a: "É exatamente para esse perfil que mais faz diferença — você ganha escala de equipe sem contratar ninguém." },
              { q: "Meu número do WhatsApp vai ficar travado ou perco mensagens?", a: "Não. Usamos API oficial do WhatsApp Business — você mantém controle total e pode assumir a conversa quando quiser." },
              { q: "Quanto custa?", a: "O investimento é sob medida. O diagnóstico é gratuito e sem compromisso. Apresentamos proposta clara após entender seu negócio — sem surpresas." },
            ].map((f, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 10 — CTA */}
        <div className="slide slide-accent" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="slide-glow" />
          <div className="cta-layout">
            <div>
              <Label text="Próximo passo" />
              <h2 style={{ fontSize: 44 }}>Agende seu diagnóstico gratuito</h2>
              <p className="cta-sub" style={{ marginTop: 12 }}>Sem ligações de vendas. Sem pressão. Resposta em até 5 minutos.</p>
            </div>
            <div className="contacts-grid">
              {[
                { icon: "📱", label: "WhatsApp", value: "(67) 99632-9837" },
                { icon: "📧", label: "E-mail", value: "contato.ideaalautomacoes@gmail.com" },
                { icon: "📸", label: "Instagram", value: "@ideal.automacoes" },
                { icon: "🌐", label: "Site", value: "idealautomacoes.com.br" },
              ].map((c, i) => (
                <div key={i} className="contact-card">
                  <div className="contact-icon">{c.icon}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
