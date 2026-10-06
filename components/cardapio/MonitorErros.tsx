"use client"
import { useEffect } from "react"
import { ligarMonitorErros } from "@/lib/cardapio/erros"

/** Liga o monitor de erros em todas as telas do cardápio (cardápio, painel, cadastro). */
export function MonitorErros() {
  useEffect(() => {
    ligarMonitorErros()
  }, [])
  return null
}
