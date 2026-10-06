import { cache } from "react"
import { supabaseConfigurado, supabaseServidor } from "@/lib/supabase/cliente"
import { getRestaurante } from "./restaurantes"
import { type CardapioBanco, deBanco } from "./mapear"
import type { Restaurante } from "./types"

/**
 * Carrega o cardápio: do banco quando o Supabase está configurado; se o slug
 * não existir lá (ou sem banco), usa os restaurantes de demonstração.
 */
export const carregarRestaurante = cache(async (slug: string): Promise<Restaurante | null> => {
  if (supabaseConfigurado) {
    try {
      const { data, error } = await supabaseServidor().rpc("cardapio_publico", { p_slug: slug })
      if (!error && data) return deBanco(data as CardapioBanco)
      if (error) console.error("cardapio_publico:", error.message)
    } catch (e) {
      console.error("cardapio_publico:", e)
    }
  }
  return getRestaurante(slug) ?? null
})
