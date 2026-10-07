# O que ficou pronto à noite (07/10)

Tudo está salvo no GitHub, no ramo `claude/nfc-qr-menu-videos-ao6qaq`.

## Vendas
| Entrega | Onde está |
|---|---|
| Vídeo de apresentação da **Road House** (1min07) | `videos/reels/video-road-house/video-road-house-narrado.mp4` |
| Cardápio demo da **Road House** (com logo, cores, 15 itens com preço e fotos em vídeo) | `/cardapio/road-house` no site, arquivo `lib/cardapio/restaurantes/road-house.ts` |
| Telas do cardápio da Road House (para mandar por WhatsApp) | `conteudo/road-house/telas/` |
| Vídeo institucional da **Ideal Automações** (55s) | `videos/reels/video-ideal-automacoes/video-ideal-automacoes-narrado.mp4` |
| Resposta ao **AGENTE**: direct na hora pedindo dia e horário do diagnóstico | `docs/instagram/` (SQL + n8n + guia) |

## Conteúdo das semanas 2 a 4
| Entrega | Onde está |
|---|---|
| 6 reels narrados | `videos/reels/reel-*/` (arquivo `*-narrado.mp4`) |
| 4 carrosséis no seu modelo, com as suas fotos (PNG + JPG) | `conteudo/instagram/carrossel-*/` |
| Calendário dia a dia + legendas + stories + 3 roteiros para gravar | `conteudo/instagram/SEMANAS-2-A-4.md` |
| Prévia dos 4 carrosséis numa imagem só | `conteudo/instagram/previa-carrosseis-semanas-2-a-4.jpg` |

## Para colocar no ar
| Entrega | Onde está |
|---|---|
| Checklist passo a passo (Supabase, Vercel, n8n, testes, Road House) | `docs/PUBLICAR-CHECKLIST.md` |

## Ferramentas novas, para as próximas vezes
- `videos/reels/gerar_reel.py`: gera um reel narrado a partir de um roteiro simples, no seu padrão visual.
- `conteudo/instagram/gerar_carrossel.py`: gera um carrossel no seu modelo a partir de um roteiro.
- `scripts/cardapio/fotos_para_videos.py`: transforma fotos de pratos em vídeos para o cardápio, para restaurante que ainda não gravou.

## O que depende de você
1. **Ouvir os vídeos.** Eu não consigo ouvir daqui. Se alguma palavra soar estranha, me diga qual e em que vídeo.
2. **Road House:** pedir a logo em alta e as fotos ou vídeos originais. A demo usa recortes dos prints.
3. **Publicar:** seguir o `docs/PUBLICAR-CHECKLIST.md`. O primeiro passo é me pedir para abrir o Pull Request.
4. **Fotos novas suas:** com mais 3 ou 4 fotos variadas, as capas dos carrosséis ficam menos repetidas.
