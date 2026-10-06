import type { Restaurante } from "../types"

// Modelo para um restaurante novo. Copie este arquivo para `<slug>.ts`,
// troque o nome da constante e preencha. Vídeos e posters ficam em
// public/midia/<slug>/videos/<midia>.mp4|.webm e public/midia/<slug>/posters/<midia>.jpg
// (o script scripts/cardapio/preparar_videos.py gera tudo a partir dos vídeos gravados).

export const modelo: Restaurante = {
  slug: "nome-do-restaurante", // vira o link: /cardapio/nome-do-restaurante
  nome: "Nome do Restaurante",
  tipo: "Tipo de cozinha",
  cidade: "Cidade · UF",
  endereco: "Rua, número — Bairro",
  horario: "Seg a Dom · 11h às 23h",
  instagram: "@restaurante",
  branding: {
    primary: "#E4572E", // botões, preço, aba ativa
    onPrimary: "#FFFFFF", // texto em cima da cor principal
    accent: "#FFC914", // selo "mais pedido"
    bg: "#111111", // fundo
    surface: "#1C1C1C", // cartões
    text: "#FFFFFF",
    muted: "#A0A0A0",
    fontDisplay: "bricolage", // anton | fraunces | shippori | bricolage | playfair | jakarta
    fontBody: "jakarta",
    radius: 16, // 0 = quadrado, 28 = bem arredondado
    logoText: "NOME",
    logoMark: "N", // aparece se não houver logo em imagem
    logo: "/midia/nome-do-restaurante/logo.png", // opcional: apague a linha se não tiver
    tagline: "Frase da tela de abertura.",
  },
  categorias: [
    { id: "pratos", nome: "Pratos", emoji: "🍽️" },
    { id: "bebidas", nome: "Bebidas", emoji: "🥤" },
  ],
  itens: [
    {
      id: "prato-exemplo",
      nome: "Prato Exemplo",
      descricao: "Descrição curta e apetitosa do prato.",
      preco: 39.9,
      categoria: "pratos",
      midia: "prato-exemplo", // nome do arquivo do vídeo, sem extensão
      pedidos30d: 0, // vendas do último mês (relatório do caixa)
      pedidosMesAnterior: 0,
      curtidas: 0,
      // opcionais: precoAntigo, tempoPreparo, serve, tags, combinaCom, destaqueDoMes, notaDoChef
    },
  ],
}
