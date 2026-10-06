"use client"
import { useEffect, useState } from "react"
import QRCode from "qrcode"

/** QR Code em SVG. `caminho` é relativo ao site (ex.: /cardapio/brasa-burger?mesa=7). */
export function QR({ caminho, cor = "#000000", fundo = "#ffffff", className = "" }: { caminho: string; cor?: string; fundo?: string; className?: string }) {
  const [svg, setSvg] = useState("")

  useEffect(() => {
    const url = new URL(caminho, window.location.origin).toString()
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: cor, light: fundo } })
      .then(setSvg)
      .catch(() => setSvg(""))
  }, [caminho, cor, fundo])

  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
}
