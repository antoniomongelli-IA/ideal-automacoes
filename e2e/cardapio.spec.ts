import { expect, test } from "@playwright/test"
import { abrirCardapio, esperarRegistro, limparRegistros } from "./apoio"

// Cardápio de demonstração (arquivos do projeto) e cardápio "do banco" (Supabase de mentira).

test.beforeEach(async () => {
  await limparRegistros()
})

test("abre o cardápio, troca de aba, abre um prato e volta para a lista", async ({ page }) => {
  await abrirCardapio(page, "/cardapio/brasa-burger")
  await expect(page.getByRole("heading", { name: "Bacon Duplo" }).first()).toBeVisible()

  await page.getByRole("button", { name: "Cardápio", exact: true }).click()
  await expect(page.getByRole("heading", { name: /Burgers/ })).toBeVisible()

  await page.getByRole("button", { name: /Smash Clássico/ }).first().click()
  const voltar = page.getByRole("button", { name: /Voltar ao cardápio/ })
  await expect(voltar).toBeVisible()
  await voltar.click()
  await expect(voltar).toBeHidden()
  await expect(page.getByRole("heading", { name: /Burgers/ })).toBeVisible()
})

test("link de um prato abre direto nele, com a prévia do prato", async ({ page }) => {
  await abrirCardapio(page, "/cardapio/brasa-burger?item=chopp-pilsen")
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Chopp/)
  await expect(page.getByRole("heading", { name: /Chopp/ }).first()).toBeInViewport()
})

test("navegar pelo cardápio não estoura o limite de histórico do iPhone", async ({ page }) => {
  // o Safari derruba a página com mais de 100 mudanças de histórico em 10 s
  await page.addInitScript(() => {
    const w = window as unknown as { __hist: number }
    w.__hist = 0
    for (const f of ["pushState", "replaceState"] as const) {
      const original = history[f].bind(history)
      history[f] = (...args: Parameters<History["pushState"]>) => {
        w.__hist++
        return original(...args)
      }
    }
  })
  await abrirCardapio(page, "/cardapio/brasa-burger")
  const feed = page.locator(".snap-y").first()
  for (let i = 0; i < 6; i++) {
    await feed.evaluate((el) => el.scrollBy(0, el.clientHeight))
    await page.waitForTimeout(250)
  }
  await page.getByRole("button", { name: "Cardápio", exact: true }).click()
  await page.getByRole("button", { name: /Smash Clássico/ }).first().click()
  await page.getByRole("button", { name: /Voltar ao cardápio/ }).click()
  await page.waitForTimeout(1500)
  const total = await page.evaluate(() => (window as unknown as { __hist: number }).__hist)
  expect(total).toBeLessThan(40)
})

test("promoção com horário aparece só dentro do horário", async ({ page }) => {
  // demonstração: happy hour de terça a sexta, 18h às 20h, chopp por R$ 12,90
  await page.clock.setFixedTime(new Date("2026-10-06T19:00:00-04:00")) // terça 19h
  await abrirCardapio(page, "/cardapio/brasa-burger")
  const aviso = page.getByRole("button", { name: /Happy hour · Chopp Pilsen.* por R\$\s?12,90/ })
  await expect(aviso).toBeVisible()
  await aviso.click()
  await expect(page.getByText(/Happy hour · até 20h/i).first()).toBeVisible()

  await page.clock.setFixedTime(new Date("2026-10-06T21:00:00-04:00")) // terça 21h
  await abrirCardapio(page, "/cardapio/brasa-burger")
  await expect(page.getByRole("button", { name: /Happy hour/ })).toHaveCount(0)
})

test("Pedir pelo WhatsApp abre a conversa com o item e conta no painel", async ({ page, context }) => {
  await context.route("https://wa.me/**", (r) => r.fulfill({ body: "whatsapp" }))
  await abrirCardapio(page, "/cardapio/teste-burguer")
  const pedir = page.getByRole("link", { name: "Pedir" }).first()
  await expect(pedir).toBeVisible()
  const href = (await pedir.getAttribute("href")) ?? ""
  expect(href).toContain("https://wa.me/5567996102537?text=")
  expect(decodeURIComponent(href)).toContain("X-Bacon da Casa")

  const [popup] = await Promise.all([page.waitForEvent("popup"), pedir.click()])
  // na hora do toque, o link do prato entra na mensagem
  expect(decodeURIComponent(popup.url())).toContain("/cardapio/teste-burguer?item=")
  await popup.close()
  await esperarRegistro((r) => r.caminho.endsWith("/registrar_eventos") && JSON.stringify(r.corpo).includes('"pediu"'), "evento 'pediu' enviado ao banco")
})

test("promoção do banco mostra o preço promocional no item", async ({ page }) => {
  await abrirCardapio(page, "/cardapio/teste-burguer")
  await expect(page.getByRole("button", { name: /Prato do dia · Smash do Dia por R\$\s?20,00/ })).toBeVisible()
})

test("convite para criar conta aos 2 minutos e Avalie no Google aos 5", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-06T12:00:00-04:00") })
  await abrirCardapio(page, "/cardapio/teste-burguer")
  await page.clock.runFor(60_000)
  await expect(page.getByRole("heading", { name: "Salve seus favoritos" })).toBeHidden()

  await page.clock.runFor(65_000) // passou de 2 min
  await expect(page.getByRole("heading", { name: "Salve seus favoritos" })).toBeVisible()
  await expect(page.locator("#conta-aceita")).toBeChecked() // "aceito receber mensagens" já vem marcado
  await page.getByRole("button", { name: "Fechar" }).click()

  await page.clock.runFor(185_000) // passou de 5 min
  await expect(page.getByRole("heading", { name: /Está gostando do Teste Burguer/ })).toBeVisible()
  await expect(page.getByRole("link", { name: /Avaliar no Google/ })).toHaveAttribute("href", "https://g.page/r/teste/review")
})

test("cliente esqueceu a senha: recebe código no WhatsApp e troca a senha", async ({ page }) => {
  await abrirCardapio(page, "/cardapio/teste-burguer")
  await page.getByRole("button", { name: "Meus favoritos" }).click()
  await page.getByRole("button", { name: "Criar conta ou entrar" }).click()
  await page.getByRole("button", { name: "Já tenho conta: entrar" }).click()
  await page.getByRole("button", { name: "Esqueci minha senha" }).click()
  await page.locator("#conta-telefone").fill("67999990000")
  await page.getByRole("button", { name: "Enviar código no WhatsApp" }).click()
  await esperarRegistro((r) => r.caminho.endsWith("/pedir_codigo_senha") && r.corpo?.p_login === "(67) 99999-0000" && r.corpo?.p_origem === "teste-burguer", "pedido de código")

  await page.locator("#conta-codigo").fill("111111")
  await page.locator("#conta-senha").fill("segredo1")
  await page.getByRole("button", { name: "Salvar nova senha e entrar" }).click()
  await expect(page.getByText("Código incorreto")).toBeVisible()

  await page.locator("#conta-codigo").fill("123456")
  await page.getByRole("button", { name: "Salvar nova senha e entrar" }).click()
  await expect(page.getByText(/Pronto, Ana!/)).toBeVisible()
})

test("dono esqueceu a senha: código vai para o WhatsApp do estabelecimento", async ({ page }) => {
  await page.goto("/cardapio/entrar")
  await page.getByRole("button", { name: "Esqueci minha senha" }).click()
  await page.locator("#entrar-email").fill("dono@teste.com")
  await page.getByRole("button", { name: "Enviar código no WhatsApp" }).click()
  await expect(page.locator("#entrar-codigo")).toBeVisible()
  await esperarRegistro((r) => r.caminho.endsWith("/pedir_codigo_senha") && r.corpo?.p_login === "dono@teste.com", "pedido de código do dono")
})

test("erro no celular do cliente é registrado no banco", async ({ page }) => {
  await abrirCardapio(page, "/cardapio/teste-burguer")
  await page.evaluate(() => setTimeout(() => {
    throw new Error("erro de teste do monitor")
  }))
  await esperarRegistro((r) => r.caminho.endsWith("/registrar_erro") && r.corpo?.p_mensagem === "erro de teste do monitor" && r.corpo?.p_slug === "teste-burguer", "erro registrado")
})

test("abrir o cardápio não gera erro na página", async ({ page }) => {
  const erros: string[] = []
  page.on("pageerror", (e) => erros.push(e.message))
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()))
  for (const caminho of ["/cardapio/brasa-burger", "/cardapio/teste-burguer", "/cardapio/teste-burguer?item=00000000-0000-4000-8000-0000000000b2"]) {
    await abrirCardapio(page, caminho)
  }
  expect(erros).toEqual([])
})
