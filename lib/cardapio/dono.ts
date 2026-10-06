"use client"
import { supabaseNavegador } from "@/lib/supabase/cliente"
import type { Branding } from "./types"

// Login e dados do dono do estabelecimento (painel).

export interface EstabelecimentoBanco {
  id: string
  slug: string
  nome: string
  nicho: string
  cidade: string | null
  endereco: string | null
  horario: string | null
  instagram: string | null
  whatsapp: string | null
  branding: Partial<Branding>
  logo_url: string | null
  ativo: boolean
  pedido_whatsapp: boolean
  google_avaliacao: string | null
}

export const traduzirErro = (msg: string) => {
  if (/already registered|already exists/i.test(msg)) return "Esse e-mail já tem conta. Use “Entrar”."
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos."
  if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres."
  if (/email not confirmed/i.test(msg)) return "Confirme o e-mail (ou desligue “Confirm email” no Supabase) e entre de novo."
  if (/unable to validate email|invalid email/i.test(msg)) return "E-mail inválido."
  if (/duplicate key.*slug/i.test(msg)) return "Esse link já está em uso. Escolha outro."
  return msg
}

export async function entrarDono(email: string, senha: string) {
  const { error } = await supabaseNavegador().auth.signInWithPassword({ email: email.trim(), password: senha })
  return error ? traduzirErro(error.message) : null
}

export async function criarContaDono(email: string, senha: string) {
  const { data, error } = await supabaseNavegador().auth.signUp({ email: email.trim(), password: senha })
  if (error) return traduzirErro(error.message)
  if (!data.session) return traduzirErro("email not confirmed")
  return null
}

export async function sairDono() {
  await supabaseNavegador().auth.signOut()
}

export async function usuarioLogado() {
  const { data } = await supabaseNavegador().auth.getSession()
  return data.session?.user ?? null
}

/** Estabelecimentos que a pessoa logada administra (o dono vê o dele; admin vê todos). */
export async function meusEstabelecimentos(): Promise<EstabelecimentoBanco[]> {
  const u = await usuarioLogado()
  if (!u) return []
  const sb = supabaseNavegador()
  // eh_dono de um id que não existe só dá verdadeiro para quem é admin
  const { data: admin } = await sb.rpc("eh_dono", { p_est: "00000000-0000-0000-0000-000000000000" })
  const consulta = sb.from("estabelecimentos").select("id, slug, nome, nicho, cidade, endereco, horario, instagram, whatsapp, branding, logo_url, ativo, pedido_whatsapp, google_avaliacao").order("criado_em")
  const { data } = admin ? await consulta : await consulta.eq("dono_id", u.id)
  return (data as EstabelecimentoBanco[]) ?? []
}
