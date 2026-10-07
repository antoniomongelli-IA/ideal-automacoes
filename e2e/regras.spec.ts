import { expect, test } from "@playwright/test"
import { aplicarPromocoes, linkPedidoWhatsapp, promoNoAr, promoQuando, telefone55 } from "../lib/cardapio/utils"
import type { Promocao, Restaurante } from "../lib/cardapio/types"

// Regras de negócio, sem navegador.

const happy: Promocao = { id: "h", titulo: "Happy hour", descricao: "", itemId: "chopp", precoPromo: 9.9, dias: [1, 2, 3, 4, 5], inicio: "18:00", fim: "20:00" }
// 2026-10-06 é uma terça-feira
const em = (diaHora: string) => new Date(`2026-10-${diaHora}`)

test("promoção vale só nos dias e horários marcados", () => {
  expect(promoNoAr(happy, em("06T18:00"))).toBe(true)
  expect(promoNoAr(happy, em("06T19:59"))).toBe(true)
  expect(promoNoAr(happy, em("06T20:00"))).toBe(false)
  expect(promoNoAr(happy, em("06T17:59"))).toBe(false)
  expect(promoNoAr(happy, em("11T19:00"))).toBe(false) // domingo
})

test("promoção que passa da meia-noite termina no dia seguinte", () => {
  const madrugada: Promocao = { ...happy, dias: [5], inicio: "22:00", fim: "02:00" } // sexta
  expect(promoNoAr(madrugada, em("09T23:00"))).toBe(true) // sexta 23h
  expect(promoNoAr(madrugada, em("10T01:30"))).toBe(true) // sábado 1h30
  expect(promoNoAr(madrugada, em("10T02:00"))).toBe(false)
  expect(promoNoAr(madrugada, em("08T23:00"))).toBe(false) // quinta
})

test("promoção do dia todo", () => {
  const diaTodo: Promocao = { ...happy, dias: [3], inicio: "00:00", fim: "00:00" } // quarta
  expect(promoNoAr(diaTodo, em("07T00:00"))).toBe(true)
  expect(promoNoAr(diaTodo, em("07T23:59"))).toBe(true)
  expect(promoNoAr(diaTodo, em("06T12:00"))).toBe(false)
  expect(promoQuando(diaTodo)).toBe("Qua · o dia todo")
  expect(promoQuando(happy)).toBe("Seg a Sex · 18h às 20h")
})

test("preço promocional entra no item e o antigo aparece riscado", () => {
  const r = { itens: [{ id: "chopp", nome: "Chopp", preco: 18.9 }, { id: "outro", nome: "Outro", preco: 10 }] } as unknown as Restaurante
  const [chopp, outro] = aplicarPromocoes(r, [happy]).itens
  expect(chopp.preco).toBe(9.9)
  expect(chopp.precoAntigo).toBe(18.9)
  expect(chopp.promo).toEqual({ titulo: "Happy hour", ate: "até 20h" })
  expect(outro.promo).toBeUndefined()
})

test("telefone do WhatsApp sempre com 55", () => {
  for (const t of ["(67) 99610-2537", "+55 67 99610-2537", "067 99610-2537", "5567996102537"]) expect(telefone55(t)).toBe("5567996102537")
})

test("link do Pedir pelo WhatsApp leva o item, o preço e o link", () => {
  const link = linkPedidoWhatsapp("(67) 99610-2537", { nome: "X-Bacon", preco: 32.9 }, "https://site/cardapio/x?item=1")
  expect(link.startsWith("https://wa.me/5567996102537?text=")).toBe(true)
  const texto = decodeURIComponent(link.split("text=")[1])
  expect(texto).toContain("*X-Bacon*")
  expect(texto).toContain("R$")
  expect(texto).toContain("32,90")
  expect(texto).toContain("https://site/cardapio/x?item=1")
})
