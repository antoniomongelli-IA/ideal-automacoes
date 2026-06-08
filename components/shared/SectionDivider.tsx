export function SectionDivider({ dim = false }: { dim?: boolean }) {
  return (
    <div className={`section-divider${dim ? " section-divider-dim" : ""}`} aria-hidden="true" />
  )
}
