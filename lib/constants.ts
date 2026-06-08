// lib/constants.ts

export const WHATSAPP_NUMBER = "5567996329837"

export const SERVICES = [
  {
    id: "whatsapp",
    icon: "MessageCircle",
    title: "Atendimento Inteligente via WhatsApp",
    description: "Assistente 24/7 que responde clientes, qualifica leads e agenda reuniões sem intervenção humana.",
  },
  {
    id: "sdr",
    icon: "Bot",
    title: "SDR Automatizado com IA",
    description: "Primeira abordagem, qualificação e agendamento automáticos — mais velocidade, menos custo operacional.",
  },
  {
    id: "leads",
    icon: "RefreshCw",
    title: "Recuperação de Leads Perdidos",
    description: "Follow-up automático de orçamentos esquecidos, checkouts abandonados e leads sem resposta.",
  },
  {
    id: "instagram",
    icon: "Instagram",
    title: "Automação para Instagram",
    description: "Responde comentários e directs automaticamente, captura leads e direciona para vendas.",
  },
  {
    id: "traffic",
    icon: "TrendingUp",
    title: "Tráfego Pago com IA",
    description: "Campanhas otimizadas com IA para geração de leads, agendamentos e escala comercial.",
  },
  {
    id: "integrations",
    icon: "Plug",
    title: "Integrações Empresariais",
    description: "Conectamos WhatsApp, CRM, ERP, planilhas e APIs para que seus sistemas trabalhem juntos.",
  },
]

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Diagnóstico",
    description: "Mapeamos seu processo, identificamos gargalos e definimos a automação com maior impacto para o seu negócio. Você sai com clareza total antes de investir.",
    image: "/how/diagnostico.jpg",
    imageAlt: "Diagnóstico do processo",
    tag: "Semana 1–2",
  },
  {
    step: "02",
    title: "Implementação",
    description: "Construímos a solução sob medida com entregas ágeis, integrando às ferramentas que você já usa — WhatsApp, CRM, ERP ou planilhas.",
    image: "/how/implementacao.jpg",
    imageAlt: "Implementação da automação",
    tag: "Semana 3–4",
  },
  {
    step: "03",
    title: "Ativação & Resultado",
    description: "Sua operação entra no piloto automático. Acompanhamos métricas, ajustamos o fluxo e garantimos que você veja retorno desde o primeiro mês.",
    image: "/how/resultado.jpg",
    imageAlt: "Resultado e métricas",
    tag: "A partir da semana 5",
  },
]

export const CASES = [
  {
    company: "Care Mais Saúde",
    niche: "Home Care / Saúde",
    problem: "Atendimento manual sobrecarregado e demora no retorno de pacientes.",
    solution: "Agente de IA no WhatsApp para triagem, agendamento e envio de informações.",
    result: "Tempo de resposta reduzido de 2h para menos de 1 minuto.",
    brandColor: "#00B4D8",
    logo: "/logos/care-mais.png",
  },
  {
    company: "Kabana's Flores",
    niche: "Floricultura",
    problem: "Atendimento manual no WhatsApp e pedidos sem organização.",
    solution: "Automação de pedidos, catálogo e atendimento via WhatsApp com IA.",
    result: "Redução de 80% no tempo de resposta e aumento de pedidos recorrentes.",
    brandColor: "#E91E8C",
    logo: "/logos/kabana-flores.png",
  },
  {
    company: "Vila da Mônica",
    niche: "Turismo / Parque",
    problem: "Alto volume de dúvidas e solicitações de agendamento via WhatsApp.",
    solution: "Atendente virtual com envio automático de imagens, vídeos e agendamento.",
    result: "Equipe de atendimento focada apenas em casos complexos.",
    brandColor: "#E63946",
    logo: "/logos/vila-monica.png",
  },
  {
    company: "doTERRA",
    niche: "Óleos Essenciais",
    problem: "Alto volume de mensagens e atendimento lento para clientes interessados.",
    solution: "Agente de IA no WhatsApp para atendimento automático e qualificação de clientes.",
    result: "Tempo de resposta reduzido para menos de 1 minuto.",
    brandColor: "#9B7FC7",
    logo: "/logos/doterra.svg",
  },
  {
    company: "Faculdade Iguaçu",
    niche: "Educação Superior",
    problem: "Atendimento a alunos sobrecarregado e processos de matrícula manuais.",
    solution: "Agente de IA para atendimento de alunos, dúvidas e processo de matrícula.",
    result: "Redução de 70% nas consultas manuais ao setor administrativo.",
    brandColor: "#1A6FA8",
    logo: "/logos/faculdade-iguacu.png",
  },
  {
    company: "eLAV",
    niche: "Serviços / Lavanderia",
    problem: "Gestão de pedidos e comunicação com clientes feita manualmente.",
    solution: "Integração WhatsApp + sistema de pedidos com notificações automáticas.",
    result: "Zero falhas de comunicação e clientes sempre atualizados.",
    brandColor: "#0077B6",
    logo: "/logos/elav.png",
  },
]

export const NICHES = [
  { label: "Imobiliárias", icon: "Building2" },
  { label: "Clínicas", icon: "Stethoscope" },
  { label: "Home Care", icon: "Heart" },
  { label: "E-commerce", icon: "ShoppingCart" },
  { label: "Educação", icon: "GraduationCap" },
  { label: "Advocacia", icon: "Scale" },
  { label: "Hotéis", icon: "Hotel" },
  { label: "Agências", icon: "Megaphone" },
  { label: "Empresas B2B", icon: "Briefcase" },
  { label: "Prestadores de Serviço", icon: "Wrench" },
  { label: "Salões de Beleza", icon: "Scissors" },
  { label: "Oficinas Mecânicas", icon: "Car" },
]

export const TECHNOLOGIES = [
  // Automação & WhatsApp
  { name: "n8n" },
  { name: "Evolution API" },
  { name: "UazAPI" },
  { name: "WAHA API" },
  { name: "WhatsApp Business" },
  { name: "Typebot" },
  { name: "ManyChat" },
  // IA & LLMs
  { name: "OpenAI" },
  { name: "Anthropic Claude" },
  { name: "Groq" },
  { name: "Gemini" },
  { name: "LangChain" },
  { name: "Flowise" },
  // Backend & Banco
  { name: "Supabase" },
  { name: "PostgreSQL" },
  { name: "Redis" },
  { name: "Node.js" },
  { name: "Python" },
  { name: "FastAPI" },
  // Integrações & APIs
  { name: "REST APIs" },
  { name: "Webhooks" },
  { name: "Instagram" },
  { name: "Google Sheets" },
  { name: "Make (Integromat)" },
  { name: "Zapier" },
  { name: "HubSpot" },
  { name: "RD Station" },
  // DevOps & Infra
  { name: "Docker" },
  { name: "VPS Linux" },
  { name: "Nginx" },
  { name: "GitHub Actions" },
  { name: "Vercel" },
]

export const VALUES = [
  { label: "Resultado", icon: "Target" },
  { label: "Transparência", icon: "Eye" },
  { label: "Inovação", icon: "Zap" },
]
