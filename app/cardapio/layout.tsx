import type { Metadata, Viewport } from "next"
import { fontesCardapio } from "@/components/cardapio/fonts"

export const metadata: Metadata = {
  title: "Cardápio em Vídeo · Ideal Automações",
  description: "Cardápio digital estilo TikTok: o cliente aproxima o celular da mesa (NFC) ou lê o QR Code e vê os pratos em vídeo.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function CardapioLayout({ children }: { children: React.ReactNode }) {
  return <div className={fontesCardapio}>{children}</div>
}
