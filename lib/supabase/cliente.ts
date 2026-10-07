import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Projeto Supabase do Cardápio em Vídeo. A chave "anon" é pública por natureza (vai para
// o navegador de todo visitante); quem protege os dados são as regras (RLS) do schema.sql.
// Variáveis de ambiente na Vercel, se existirem, têm prioridade.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trcqtglwrlykmyjefekb.supabase.co"
export const SUPABASE_CHAVE =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyY3F0Z2x3cmx5a215amVmZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDA3MTIsImV4cCI6MjEwNjg3NjcxMn0.dkKHvnjBfWObNOBw6H6VqQIDVXNslmQpow3IVRS0CKc"
const URL = SUPABASE_URL
const CHAVE = SUPABASE_CHAVE

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
