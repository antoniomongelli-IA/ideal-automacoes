import { Resend } from "resend"

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "placeholder")

export interface ContactPayload {
  name: string
  company: string
  segment: string
  challenge: string
}

export async function sendContactEmail(payload: ContactPayload) {
  const { data, error } = await getResend().emails.send({
    from: "site@idealautomacoes.com.br",
    to: process.env.CONTACT_EMAIL!,
    subject: `Novo contato: ${payload.name} — ${payload.company}`,
    html: `
      <h2>Novo contato pelo site</h2>
      <p><strong>Nome:</strong> ${payload.name}</p>
      <p><strong>Empresa:</strong> ${payload.company}</p>
      <p><strong>Segmento:</strong> ${payload.segment}</p>
      <p><strong>Desafio:</strong> ${payload.challenge}</p>
    `,
  })

  if (error) throw new Error(error.message)
  return data
}
