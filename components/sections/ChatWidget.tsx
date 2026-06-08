"use client"
import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, Minimize2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "bot"
  text: string
  ts: Date
}

const WEBHOOK_URL = "https://webhook.idealautomacoes.com.br/webhook/chatsite"

function getSessionId() {
  if (typeof window === "undefined") return "anon"
  let id = sessionStorage.getItem("chat_session")
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem("chat_session", id)
  }
  return id
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ChatWidget({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Olá! 👋 Sou o assistente da Ideal Automações. Me conta: qual é o maior gargalo no atendimento da sua empresa hoje?",
      ts: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, ts: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: getSessionId(),
          source: "site",
        }),
      })

      let reply = "Desculpe, não consegui responder agora. Tente novamente!"
      if (res.ok) {
        const data = await res.json().catch(() => null)
        // n8n pode retornar { output }, { message }, { reply }, ou texto puro
        if (typeof data === "string") reply = data
        else if (data?.output) reply = data.output
        else if (data?.message) reply = data.message
        else if (data?.reply) reply = data.reply
        else if (data?.text) reply = data.text
        else if (Array.isArray(data) && data[0]?.output) reply = data[0].output
        else if (Array.isArray(data) && data[0]?.message) reply = data[0].message
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", text: reply, ts: new Date() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          text: "Parece que houve uma instabilidade. Fale comigo pelo WhatsApp! 😊",
          ts: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-500"
      style={{
        width: open ? "360px" : "0px",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transform: open ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
        transformOrigin: "bottom right",
      }}
    >
      {/* Chat window */}
      <div
        className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "#110F1E",
          border: "1px solid rgba(160,32,240,0.35)",
          boxShadow: "0 0 60px rgba(160,32,240,0.2), 0 24px 48px rgba(0,0,0,0.6)",
          height: "480px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/8"
          style={{ background: "linear-gradient(135deg, rgba(160,32,240,0.15), rgba(107,33,245,0.1))" }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #CC44FF, #6B21F5)" }}>
              <Bot size={18} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#110F1E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Assistente Ideal</p>
            <p className="text-xs text-green-400">Online agora</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
          style={{ scrollbarColor: "rgba(160,32,240,0.3) transparent" }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "linear-gradient(135deg, #CC44FF, #6B21F5)" }}>
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg, #A020F0, #6B21F5)", color: "white", borderRadius: "18px 18px 4px 18px" }
                    : { background: "rgba(255,255,255,0.06)", color: "#F4F0FF", borderRadius: "4px 18px 18px 18px", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #CC44FF, #6B21F5)" }}>
                <Bot size={14} className="text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 18px 18px 18px" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-accent/60"
                    style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-white/8">
          <div className="flex gap-2 items-center rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(160,32,240,0.25)" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
              style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #A020F0, #6B21F5)" : "rgba(255,255,255,0.1)" }}
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
          <p className="text-center text-white/20 text-[10px] mt-2">Powered by Ideal Automações ✦ IA</p>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
