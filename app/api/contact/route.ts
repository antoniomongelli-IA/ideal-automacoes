import { NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/contact"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, segment, challenge } = body

    if (!name || !company || !segment || !challenge) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 })
    }

    await sendContactEmail({ name, company, segment, challenge })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem. Tente novamente." }, { status: 500 })
  }
}
