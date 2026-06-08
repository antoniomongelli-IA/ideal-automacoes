"use client"
import { useEffect, useState } from "react"

export function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9990] bg-bg pointer-events-none"
      style={{
        animation: "pageLoaderFade 0.55s ease-out 0.1s forwards",
        opacity: 1,
      }}
    >
      <style>{`
        @keyframes pageLoaderFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
