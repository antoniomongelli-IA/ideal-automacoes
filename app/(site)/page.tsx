import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB"
import { SectionDivider } from "@/components/shared/SectionDivider"
import { Hero } from "@/components/sections/Hero"
import { Problema } from "@/components/sections/Problema"
import { Servicos } from "@/components/sections/Servicos"
import { ComoFunciona } from "@/components/sections/ComoFunciona"
import { Garantia } from "@/components/sections/Garantia"
import { Cases } from "@/components/sections/Cases"
import { Depoimentos } from "@/components/sections/Depoimentos"
import { Nichos } from "@/components/sections/Nichos"
import { Tecnologias } from "@/components/sections/Tecnologias"
import { Sobre } from "@/components/sections/Sobre"
import { FAQ } from "@/components/sections/FAQ"
import { Contato } from "@/components/sections/Contato"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionDivider />
        <Problema />
        <SectionDivider dim />
        <Servicos />
        <SectionDivider />
        <ComoFunciona />
        <SectionDivider dim />
        <Garantia />
        <SectionDivider />
        <Cases />
        <SectionDivider dim />
        <Depoimentos />
        <SectionDivider dim />
        <Nichos />
        <SectionDivider dim />
        <Tecnologias />
        <SectionDivider />
        <Sobre />
        <SectionDivider dim />
        <FAQ />
        <SectionDivider />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}
