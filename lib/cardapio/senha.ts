"use client"
import { supabaseConfigurado, supabaseNavegador } from "@/lib/supabase/cliente"

// "Esqueci minha senha" com código de 6 dígitos pelo WhatsApp (enviado pelo n8n).
// Cliente final: login = telefone. Dono: login = e-mail (o código vai para o WhatsApp do estabelecimento).

const MSG_PEDIR: Record<string, string> = {
  aguarde: "Acabamos de enviar um código. Espere 1 minuto para pedir outro.",
  limite: "Você pediu códigos demais hoje. Tente amanhã ou fale com o suporte.",
  sem_whatsapp: "Seu estabelecimento não tem WhatsApp cadastrado. Fale com o suporte para recuperar o acesso.",
}

const MSG_REDEFINIR: Record<string, string> = {
  codigo_invalido: "Código incorreto. Confira a mensagem no WhatsApp.",
  expirado: "Esse código venceu (vale 10 minutos). Peça um novo.",
  tentativas: "Muitas tentativas erradas. Peça um novo código.",
  senha_curta: "A senha precisa ter pelo menos 6 caracteres.",
}

/** Pede o código. Devolve uma mensagem de erro, ou null quando deu certo. */
export async function pedirCodigo(login: string, origem?: string): Promise<string | null> {
  if (!supabaseConfigurado) return "Disponível quando o cardápio estiver ligado ao banco."
  const { data, error } = await supabaseNavegador().rpc("pedir_codigo_senha", { p_login: login.trim(), p_origem: origem ?? null })
  if (error) return "Não foi possível enviar o código agora. Tente de novo em instantes."
  return data === "ok" ? null : (MSG_PEDIR[data as string] ?? "Não foi possível enviar o código.")
}

/** Confere o código e grava a senha nova. Devolve uma mensagem de erro, ou null quando deu certo. */
export async function redefinirSenha(login: string, codigo: string, senha: string): Promise<string | null> {
  if (!supabaseConfigurado) return "Disponível quando o cardápio estiver ligado ao banco."
  if (senha.length < 6) return MSG_REDEFINIR.senha_curta
  const { data, error } = await supabaseNavegador().rpc("redefinir_senha", { p_login: login.trim(), p_codigo: codigo.replace(/\D/g, ""), p_senha: senha })
  if (error) return "Não foi possível trocar a senha agora. Tente de novo em instantes."
  return data === "ok" ? null : (MSG_REDEFINIR[data as string] ?? "Não foi possível trocar a senha.")
}
