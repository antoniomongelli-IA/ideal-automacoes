import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB"
import { Hero } from "@/components/sections/Hero"
import { Problema } from "@/components/sections/Problema"
import { Servicos } from "@/components/sections/Servicos"
import { ComoFunciona } from "@/components/sections/ComoFunciona"
import { Cases } from "@/components/sections/Cases"
import { Nichos } from "@/components/sections/Nichos"
import { Tecnologias } from "@/components/sections/Tecnologias"
import { Sobre } from "@/components/sections/Sobre"
import { Contato } from "@/components/sections/Contato"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problema />
        <Servicos />
        <ComoFunciona />
        <Cases />
        <Nichos />
        <Tecnologias />
        <Sobre />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}
