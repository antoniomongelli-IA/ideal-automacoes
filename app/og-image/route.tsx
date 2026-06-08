import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08070F",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(160,32,240,0.25) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo placeholder circle */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #CC44FF, #6B21F5)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "white",
            fontWeight: "800",
          }}
        >
          IA
        </div>

        <div style={{ fontSize: "52px", fontWeight: "800", color: "#F4F0FF", textAlign: "center", lineHeight: 1.1, marginBottom: "16px" }}>
          Ideal Automações
        </div>
        <div style={{ fontSize: "24px", color: "#8B80A8", textAlign: "center", maxWidth: "700px" }}>
          Agentes de IA e automações que eliminam trabalho manual e aumentam suas vendas.
        </div>

        <div
          style={{
            marginTop: "40px",
            padding: "12px 28px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #A020F0, #6B21F5)",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          idealautomacoes.com.br
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
