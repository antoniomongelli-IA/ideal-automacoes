import { expect, test } from "@playwright/test"
import { esperarRegistro, limparRegistros } from "./apoio"

// Painel do dono (com o Supabase de mentira).

test.beforeEach(async ({ page }) => {
  await limparRegistros()
  await page.goto("/cardapio/entrar")
  await page.locator("#entrar-email").fill("dono@teste.com")
  await page.locator("#entrar-senha").fill("segredo1")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Teste Burguer" })).toBeVisible()
})

test("resultados mostram pedidos pelo WhatsApp e cliques no Google", async ({ page }) => {
  const pedidos = page.locator("div.rounded-xl", { hasText: "Pedidos pelo WhatsApp" })
  await expect(pedidos).toContainText("7")
  await expect(page.locator("div.rounded-xl", { hasText: "Avaliar no Google" })).toContainText("3")
})

test("pausar um item tira do cardápio e o botão volta ele ao normal", async ({ page }) => {
  await page.getByRole("button", { name: "Itens" }).click()
  const linha = page.locator("li", { hasText: "Batata Rústica" })
  await linha.getByRole("button", { name: "Pausar" }).click()
  await expect(linha.getByText("Pausado · fora do cardápio")).toBeVisible()
  await expect(page.getByText(/1 item pausado/)).toBeVisible()
  await esperarRegistro((r) => r.caminho === "/rest/v1/itens" && r.corpo?.ativo === false, "item pausado no banco")

  await linha.getByRole("button", { name: "Voltar ao cardápio" }).click()
  await expect(linha.getByText("Pausado · fora do cardápio")).toBeHidden()
  await esperarRegistro((r) => r.caminho === "/rest/v1/itens" && r.corpo?.ativo === true, "item de volta no banco")
})

test("dono cria uma promoção com dias e horário", async ({ page }) => {
  await page.getByRole("button", { name: "Promoções" }).click()
  await page.getByRole("button", { name: "Nova promoção" }).click()
  await page.locator("#promo-titulo").fill("Happy hour")
  await page.locator("#promo-item").selectOption({ index: 3 }) // Batata Rústica (R$ 24,90)
  await page.locator("#promo-preco").fill("30")
  await page.getByRole("button", { name: "Criar promoção" }).click()
  await expect(page.getByText(/precisa ser menor que o preço normal/)).toBeVisible()

  await page.locator("#promo-preco").fill("19,90")
  await page.getByRole("button", { name: "Fim de semana" }).click()
  await page.locator("#promo-inicio").fill("18:00")
  await page.locator("#promo-fim").fill("20:00")
  await page.getByRole("button", { name: "Criar promoção" }).click()
  await expect(page.getByText("Sáb, Dom · 18h às 20h").or(page.getByText("Dom, Sáb · 18h às 20h"))).toBeVisible()
  await esperarRegistro(
    (r) => r.caminho === "/rest/v1/promocoes" && r.corpo?.titulo === "Happy hour" && r.corpo?.preco_promo === 19.9 && JSON.stringify(r.corpo?.dias) === "[0,6]",
    "promoção gravada no banco",
  )
})

test("liga o Pedir pelo WhatsApp e salva o link do Google", async ({ page }) => {
  await page.getByRole("button", { name: "Dados do local" }).click()
  // começa ligado no cardápio de teste: desliga e liga de novo
  await page.getByRole("button", { name: "Ligado" }).click()
  await expect(page.getByRole("button", { name: "Desligado" })).toBeVisible()
  await esperarRegistro((r) => r.caminho === "/rest/v1/estabelecimentos" && r.corpo?.pedido_whatsapp === false, "pedido pelo WhatsApp desligado")
  await page.getByRole("button", { name: "Desligado" }).click()
  await esperarRegistro((r) => r.caminho === "/rest/v1/estabelecimentos" && r.corpo?.pedido_whatsapp === true, "pedido pelo WhatsApp ligado")

  await page.locator("#dados-google").fill("g.page/sem-https")
  await expect(page.getByText("Cole o link completo")).toBeVisible()
  await page.locator("#dados-google").fill("https://g.page/r/novo/review")
  await page.getByRole("button", { name: "Salvar link" }).click()
  await esperarRegistro((r) => r.caminho === "/rest/v1/estabelecimentos" && r.corpo?.google_avaliacao === "https://g.page/r/novo/review", "link do Google salvo")
})
