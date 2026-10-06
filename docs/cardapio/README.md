# Cardápio em Vídeo (MVP)

Cardápio digital estilo TikTok: o cliente aproxima o celular da mesa (NFC) ou lê o QR Code e rola os pratos em vídeo vertical.

![Telas no celular](telas-celular.png)

## Rotas

| Rota | O que é |
|---|---|
| `/cardapio` | Vitrine do produto (para vender aos restaurantes): demo interativa, 3 restaurantes, recursos e planos |
| `/cardapio/[slug]?mesa=7` | O cardápio do cliente. `mesa` vem do link gravado na etiqueta NFC / QR da mesa |
| `/cardapio/[slug]/painel` | Painel do restaurante: métricas, editor de branding com prévia ao vivo, itens do mês e placas NFC/QR |

Restaurantes de demonstração (fictícios): `brasa-burger`, `kaze-sushi`, `cantina-nonna`.

## Abas do cardápio

- **Para você**: feed vertical em vídeo (deslizar, dois toques para curtir, + para a comanda, “combina com” para upsell).
- **Mais pedidos**: ranking automático dos últimos 30 dias (pódio com vídeo, barras e crescimento), com filtro por categoria.
- **Do mês**: itens escolhidos no painel, com coroa e nota do chef. Também sobem para o topo do feed.
- **Cardápio**: grade completa com busca e categorias.

Ainda: tela de abertura com a marca e a mesa, comanda com total, botão de chamar garçom.

## Branding por restaurante

Cada restaurante tem cores (principal, destaque, fundo, cartões, textos), fonte dos títulos, arredondamento, selo, nome e frase de abertura (`lib/cardapio/types.ts` → `Branding`). Tudo vira variáveis CSS (`brandingVars`) e o mesmo código assume a cara de cada casa.

No painel, a edição muda a prévia na hora; “Publicar” salva no navegador (demo) e o cardápio aberto em outra aba atualiza sozinho. Em produção isso vira uma tabela no banco.

## Vídeos

Os 20 vídeos são animações geradas por código (Cairo + ffmpeg), em loop de 6s, 540×960, H.264 + fallback WebM, com poster `.jpg`:

```bash
pip install pycairo numpy
python scripts/cardapio/gerar_videos.py            # todos
python scripts/cardapio/gerar_videos.py ramen-tonkotsu
```

Para um restaurante real, basta trocar os arquivos em `public/cardapio/videos/<midia>.mp4|.webm` e `public/cardapio/posters/<midia>.jpg` por vídeos gravados (vertical 9:16, 6–15s, sem áudio). Em escala, use um serviço de streaming (Bunny Stream, Cloudflare Stream ou Mux).

## Próximos passos para produção

1. Banco + login do restaurante (ex.: Supabase) no lugar de `lib/cardapio/data.ts` e do localStorage.
2. Upload de vídeo pelo painel direto para o serviço de streaming.
3. Eventos reais (visualização, curtida, “+”) alimentando “Mais pedidos” e as métricas.
4. Chamar garçom via WhatsApp/n8n ou tablet do salão; depois, pedido direto para a cozinha/PDV.
