import { LenisProvider } from "@/components/shared/LenisProvider"
import { ScrollEffects } from "@/components/shared/ScrollEffects"
import { CustomCursor } from "@/components/shared/CustomCursor"
import { PageLoader } from "@/components/shared/PageLoader"
import { DotNav } from "@/components/shared/DotNav"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <PageLoader />
      <DotNav />
      <LenisProvider>
        <ScrollEffects />
        {children}
      </LenisProvider>
    </>
  )
}
