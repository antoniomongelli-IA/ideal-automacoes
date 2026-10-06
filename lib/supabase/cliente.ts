import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const CHAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** O site só usa o banco quando as duas chaves estão configuradas (na Vercel e no .env.local). */
export const supabaseConfigurado = Boolean(URL && CHAVE)

let navegador: SupabaseClient | null = null

/** Cliente para o navegador: guarda o login (dono no painel, cliente final no cardápio). */
export function supabaseNavegador() {
  if (!supabaseConfigurado) throw new Error("Supabase não configurado")
  navegador ??= createClient(URL!, CHAVE!, { auth: { persistSession: true, autoRefreshToken: true } })
  return navegador
}

/** Cliente para o servidor: só leitura pública (cardápio), sem login. */
export function supabaseServidor() {
  if (!supabaseConfigurado) throw new Error("Supabase não configurado")
  return createClient(URL!, CHAVE!, { auth: { persistSession: false, autoRefreshToken: false } })
}
