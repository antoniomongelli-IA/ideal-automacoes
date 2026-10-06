import { expect, type Page } from "@playwright/test"

export const SUPABASE_FALSO = "http://127.0.0.1:54329"

type Registro = { caminho: string; corpo: Record<string, unknown> | null }

/** Chamadas que o site fez ao banco (Supabase de mentira). */
export async function registros(): Promise<Registro[]> {
  return (await fetch(`${SUPABASE_FALSO}/__registros`)).json()
}

export async function limparRegistros() {
  await fetch(`${SUPABASE_FALSO}/__limpar`)
}

/** Espera até o banco receber uma chamada que satisfaça `teste`. */
export async function esperarRegistro(teste: (r: Registro) => boolean, mensagem: string) {
  await expect.poll(async () => (await registros()).some(teste), { message: mensagem, timeout: 15_000 }).toBe(true)
}

/** Abre o cardápio e espera a tela de abertura sumir. */
export async function abrirCardapio(page: Page, caminho: string) {
  await page.goto(caminho)
  await expect(page.locator("header nav")).toBeVisible()
  // tela de abertura (logo + nome) some sozinha em ~2 s
  await page.waitForTimeout(2300)
}
