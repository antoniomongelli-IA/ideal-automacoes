"use client"

interface Props {
  onOpen: () => void
  chatOpen: boolean
  flying?: boolean
}

export function RobotMascot({ onOpen, chatOpen, flying = false }: Props) {
  return (
    <div
      className="relative z-10 select-none block cursor-pointer"
      style={{
        animation: flying
          ? "robotFlyToChat 0.65s cubic-bezier(0.55, 0, 1, 0.45) forwards"
          : chatOpen
          ? "robotHide 0.3s ease forwards"
          : "robotFloat 4s ease-in-out infinite",
        pointerEvents: flying || chatOpen ? "none" : "auto",
      }}
      onClick={onOpen}
      title="Clique para conversar com o assistente"
    >
      <div className="relative">
        {/* Glow base */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #A020F0 0%, transparent 70%)", transform: "scale(1.4)" }}
        />

        {/* Robot image */}
        <img
          src="/robo3.png"
          alt="Assistente IA"
          className="w-44 sm:w-56 lg:w-80 h-auto relative z-10"
          style={{
            mixBlendMode: "screen",
            filter: "drop-shadow(0 0 32px rgba(160,32,240,0.5))",
          }}
          draggable={false}
        />

        {/* Speech bubble — próxima à ponta do dedo */}
        {!chatOpen && !flying && (
          <div
            className="absolute bg-surface border border-accent/30 rounded-2xl px-4 py-2.5 text-xs text-text-muted whitespace-nowrap pointer-events-none"
            style={{
              top: "-2%",
              left: "0%",
              zIndex: 20,
              animation: "bubbleFade 4s ease-in-out 1s infinite",
              boxShadow: "0 0 20px rgba(160,32,240,0.2)",
            }}
          >
            <span className="text-accent font-semibold">Clique </span>para testar nossa IA! 🤖
            {/* seta apontando para baixo-direita, em direção ao dedo */}
            <div className="absolute -bottom-2 right-4 w-3 h-3 bg-surface border-r border-b border-accent/30 rotate-45" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes robotHide {
          0%   { transform: translateY(0px) scale(1); opacity: 1; }
          100% { transform: translateY(20px) scale(0.7); opacity: 0; pointer-events: none; }
        }
        @keyframes robotFlyToChat {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          18%  { transform: translateY(-28px) scale(1.12) rotate(-6deg); opacity: 1; }
          60%  { transform: translateY(10vh) translateX(6vw) scale(0.45) rotate(10deg); opacity: 0.8; }
          100% { transform: translateY(40vh) translateX(10vw) scale(0.08) rotate(18deg); opacity: 0; }
        }
        @keyframes bubbleFade {
          0%, 20% { opacity: 0; transform: translateY(6px); }
          30%, 70% { opacity: 1; transform: translateY(0); }
          80%, 100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
