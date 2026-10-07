import { Anton, Bricolage_Grotesque, Fraunces, Playfair_Display, Shippori_Mincho } from "next/font/google"

// Fontes disponíveis para o branding dos restaurantes (a Jakarta já vem do layout raiz).
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700", "900"], style: ["normal", "italic"], variable: "--font-fraunces" })
const shippori = Shippori_Mincho({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-shippori" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-bricolage" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "800"], style: ["normal", "italic"], variable: "--font-playfair" })

export const fontesCardapio = [anton, fraunces, shippori, bricolage, playfair].map((f) => f.variable).join(" ")
