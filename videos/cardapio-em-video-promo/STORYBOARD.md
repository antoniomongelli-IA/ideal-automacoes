---
format: 1080x1920
duration: 45s
message: "Seu cardápio vira um TikTok dos seus pratos: o cliente encosta o celular na mesa, vê os pratos em vídeo e pede mais — sem app, pronto em 1 dia e cabendo no bolso do restaurante."
arc: PAS with feature-benefit progression — hook → pain → product intro → demo (feed, promo, pedido, painel) → value stack (budget) → CTA
audience: donos e gerentes de restaurantes, bares e hamburguerias com orçamento limitado
mode: autonomous
music: upbeat warm modern food commercial, light funky percussion, positive and confident
---

## Video direction

- **palette** (frame.md, registro escuro): fundo ink-black #0F0805 (quase preto quente) com profundidade em ink-black-alt #1E120B; texto creme #FFF4EA; laranja-fogo #FF6A1A é o ÚNICO acento (palavras-chave, brilhos, botões); cream-muted/hint para textos secundários. Exceções que vêm das próprias telas capturadas: o verde do botão "Pedir" e o vermelho do selo de promoção aparecem só dentro dos screenshots — nunca como cor de design.
- **tipo**: display Anton (minúsculas, apertado, enorme) para frases-impacto; Plus Jakarta Sans para rótulos/kickers; IBM Plex Mono para microrrótulos (uppercase, 0.14em).
- **assinatura 3D em camadas (pedido do cliente)**: toda cena tem ≥3 planos de profundidade — (1) fundo com brilho radial laranja suave e grão fino; (2) plano médio com o celular/painel em perspectiva 3D (rotateY/rotateX 8–20°, sombra longa); (3) primeiro plano com cartões/vídeos/frases flutuando em translateZ, com desfoque de profundidade (depth-of-field-blur) no que está fora de foco. A câmera faz movimentos de entrada (push/orbit curto) e pára — sem deriva no fim.
- **celular**: um mockup de celular escuro (cantos arredondados, moldura fina #1E120B, reflexo sutil) com os screenshots reais dentro; é o mesmo objeto em todas as cenas (continuidade).
- **motion grammar**: power3 long-tail em tudo, sem bounce; revelações no tempo da narração (cada peça entra quando a voz a nomeia); internas com cortes de velocidade casada (cut-catalog). Manter vivo só com jitter sutil.
- **ritmo**: F1–F2 rápidos e tipográficos (tensão); F3 virada; F4 é o clímax visual (mais camadas); F5–F7 demonstrações; F8 é o respiro calmo (cartões assentando, quase parado); F9 fecha com lockup e segura 2 s parado.
- **legendas**: faixa inferior ~17% reservada; nada importante abaixo de y≈1590.
- **nunca**: slideshow (tudo de uma vez e congelado), screensaver (tudo flutuando sem motivo), gradientes roxo/azul "IA", bokeh genérico, cursor de mouse, barras de navegador, logos de terceiros desenhados à mão (nada de logo do WhatsApp/TikTok/Google redesenhado — só aparecem como estão nas telas capturadas).

## Frame 1 — Cardápio que ninguém lê

- scene: Letras gigantes "cardápio de papel?" e "pdf que ninguém abre?" batem na tela enquanto uma folha de cardápio amassada e um ícone de PDF caem em profundidade 3D
- voiceover: "Cardápio de papel? Aquele PDF que ninguém abre?"
- duration: 3.251s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation
- beat: frustration + recognition
- asset_candidates:
- blueprint: kinetic-type-beats (Adapt)
- focal: tipografia
- roles: (sem assets) — folha de cardápio e ícone "PDF" desenhados como cartões simples de papel em 3D
- sfx: none

Adapt: mantém a assinatura (cada frase bate sozinha, escalando), troca o fundo liso por camadas 3D com objetos caindo.
Scene 1 (0.0–1.1s): fundo escuro com brilho laranja fraco; "cardápio de papel?" entra dead-center em Anton gigante por flash-in (hard-cut) quando a voz diz "cardápio"; atrás, uma folha de cardápio bege meio amassada cai girando em profundidade (translateZ alto → baixo, rotateX/Z) e assenta torta no plano de trás — Centered, 3 camadas.
Scene 2 (1.1–2.4s): em "Aquele PDF", a frase anterior encolhe e sobe (scale-swap) enquanto "pdf que ninguém abre?" entra em seu lugar; um cartão branco com rótulo "cardapio_final_v3.pdf" e um ícone de carregando cai do alto e bate em cima da folha; em "ninguém" a palavra recebe um risco laranja desenhado da esquerda pra direita (css-marker-patterns).
Scene 3 (2.4–3.3s): segura parado; leve jitter nos papéis; o fundo escurece um pouco antes do corte.

narrativeRole: abre na dor que todo dono reconhece, em linguagem dele.
keyMessage: o cardápio de hoje não vende.

## Frame 2 — O cliente pede o de sempre

- scene: Três frases curtas entram sozinhas, uma por vez, em camadas que se afastam: "não vê o prato", "pede o de sempre", "você vende menos" — a última em laranja
- voiceover: "O cliente não vê o prato. Pede o de sempre. E você vende menos."
- duration: 4.048s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-dor.html
- type: pain_point
- persuasion: Pain agitation
- beat: tension
- asset_candidates:
- blueprint: kinetic-type-beats (Reproduce)
- focal: tipografia
- roles: (sem assets)
- sfx: none

Scene 1 (0.0–1.3s): fundo escuro; "não vê o prato." entra por per-word staggered reveal em creme, alinhado à esquerda no terço superior, como um cartão de texto em perspectiva leve (rotateY −10°).
Scene 2 (1.3–2.4s): em "Pede o de sempre", a câmera recua em Z: o primeiro cartão afunda para trás (blur de profundidade) e "pede o de sempre." surge à frente, deslocado à direita — empilhamento em camadas.
Scene 3 (2.4–4.1s): em "E você vende menos", ambos afundam mais e "você vende menos." bate no centro, maior, com "menos" em laranja-fogo; uma seta/linha de gráfico laranja desce em diagonal atrás da frase (svg-path-draw) e segura parada.

narrativeRole: transforma o incômodo em prejuízo concreto (ticket menor).
keyMessage: cardápio sem imagem custa venda.

## Frame 3 — Encosta o celular na mesa

- scene: Um celular gira em 3D e se aproxima de uma plaquinha NFC/QR na mesa; ondas de aproximação; a tela acende com a abertura do Brasa Burger e vira o feed
- voiceover: "Agora, o cliente encosta o celular na mesa…"
- duration: 2.637s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-encosta.html
- type: product_intro
- persuasion: Friction reduction
- beat: curiosity → relief
- asset_candidates: assets/00-splash.png — tela de abertura do cardápio com logo e nome do restaurante; assets/01-feed.png — feed estilo TikTok com o Bacon Duplo
- blueprint: device-surface-showcase (Adapt)
- focal: assets/00-splash.png
- roles: 00-splash = tela do celular (cutout dentro do mockup) · 01-feed = tela seguinte no mesmo celular · plaquinha NFC/QR = objeto 3D desenhado (cartão escuro com ícone de aproximação e um QR estilizado, sem marca de terceiros)
- sfx: none

Adapt: o celular chega e "opera" sozinho: aproxima da plaquinha, ondas de aproximação, a tela acende.
Scene 1 (0.0–0.9s): uma plaquinha de mesa (cartão escuro inclinado em perspectiva, ícone de ondas NFC em laranja e um QR estilizado, texto "aproxime o celular") assenta no terço inferior-central; o celular entra do alto-direita girando em 3D (rotateY 35°→12°) com a tela apagada.
Scene 2 (0.9–1.9s): em "encosta", o celular desce até tocar a plaquinha; três ondas laranja concêntricas expandem a partir do ponto de contato (svg/escala, finitas); a tela acende com 00-splash.png (logo + Brasa Burger & Co.).
Scene 3 (1.9–2.6s): em "mesa", o celular sobe e endireita para frente (rotateY→0) enquanto a tela troca para 01-feed.png por push-up interno (como abrir o app); segura — handoff para o Frame 4.
- handoff_out: celular (mockup) centro x=540 y=860, escala 1, opacity 1, rotateY 0, parado

narrativeRole: o produto aparece resolvendo a dor com um gesto simples (sem app).
keyMessage: abrir é instantâneo.

## Frame 4 — O cardápio vira TikTok

- scene: Dentro do celular em perspectiva, o feed desliza de prato em prato (bacon, chopp, milkshake); ao redor, cartões com os vídeos reais dos pratos flutuam em camadas de profundidade; título "Cardápio em Vídeo" entra grande
- voiceover: "…e o seu cardápio vira um TikTok dos seus pratos. Em vídeo, com preço, e o mais pedido da casa."
- duration: 6.232s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-tiktok.html
- type: product_intro
- persuasion: Show-don't-tell proof
- beat: excitement + desire
- asset_candidates: assets/feed-bacon-duplo.png — feed parado no Bacon Duplo; assets/feed-chopp-pilsen.png — feed parado no Chopp; assets/feed-milkshake-morango.png — feed no milkshake de morango; assets/bacon-duplo.mp4 — vídeo real do hambúrguer em loop; assets/milkshake-ovomaltine.mp4 — vídeo real do milkshake; assets/batata-rustica.mp4 — vídeo real da batata; assets/05-mais-pedidos.png — aba Mais pedidos com ranking
- blueprint: device-surface-showcase (Adapt)
- focal: assets/feed-bacon-duplo.png
- roles: feed-bacon-duplo / feed-chopp-pilsen / feed-milkshake-morango = telas que deslizam dentro do celular (cutout) · bacon-duplo.mp4 / milkshake-ovomaltine.mp4 / batata-rustica.mp4 = cartões de vídeo flutuando em camadas ao redor (supporting, primeiro plano e fundo com blur) · 05-mais-pedidos = cartão que surge no fim (supporting)
- sfx: none
- handoff_in: celular (mockup) centro x=540 y=860, escala 1, opacity 1, rotateY 0, parado

Adapt: o celular é o herói e suas telas avançam como swipe do TikTok; a novidade é a constelação de vídeos reais em camadas 3D ao redor (o efeito em camadas pedido).
Scene 1 (0.0–1.6s): celular centrado mostrando feed-bacon-duplo; em "cardápio vira", Anton gigante "vira um tiktok" aparece ATRÁS do celular (plano de fundo, laranja translúcido), enquanto a câmera faz um push curto e o celular gira para rotateY −14°.
Scene 2 (1.6–2.8s): em "TikTok dos seus pratos", a tela do celular faz swipe vertical (feed-bacon → feed-chopp) e três cartões de vídeo dos pratos (bacon, milkshake, batata) entram de fora em profundidade — um no primeiro plano à esquerda (nítido), dois atrás à direita (com blur de profundidade) — orbit-3d-entry, sem órbita contínua.
Scene 3 (2.8–4.3s): em "Em vídeo, com preço", novo swipe (feed-chopp → feed-milkshake-morango); um chip creme com o preço do prato na tela ("R$ 22,90", milkshake de morango) destaca-se em laranja ao lado do celular, ligado por uma linha fina ao preço dentro da tela.
Scene 4 (4.3–6.3s): em "o mais pedido da casa", o cartão 05-mais-pedidos.png surge à frente do celular, inclinado, com o selo "#1" em evidência (zoom-to-target leve no selo) e segura parado; jitter sutil nos cartões de vídeo.

narrativeRole: a promessa ("vira um TikTok") aparece já no beat 4, com prova visual.
keyMessage: o prato se vende sozinho em vídeo.

## Frame 5 — Promoção no horário certo

- scene: O celular mostra o chopp com selo "HAPPY HOUR" e preço riscado; um relógio 3D gira até 18h e a faixa de promoção acende; ao fundo, o card do painel "Ter a Sex · 18h às 20h"
- voiceover: "Happy hour? A promoção aparece sozinha, só no horário que você marcar."
- duration: 4.169s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-promo.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation
- beat: control
- asset_candidates: assets/04-promo.png — chopp com selo Happy hour e preço R$ 12,90 com R$ 18,90 riscado; assets/12-painel-promocoes-cel.png — painel com o card da promoção Ter a Sex 18h às 20h
- blueprint: video-text-pivot (Adapt)
- focal: assets/04-promo.png
- roles: 04-promo = tela do celular (cutout) · 12-painel-promocoes-cel = cartão do painel atrás, em perspectiva (supporting, levemente desfocado)
- sfx: none

Adapt: a "video" é o celular com a promoção; o "stat" vira o relógio 18h–20h; a assinatura (o celular cede espaço e o dado ocupa) é mantida.
Scene 1 (0.0–1.0s): celular entra pela direita (push-slide vem do harness) já com 04-promo.png; "happy hour?" em Anton aparece no topo-esquerda quando a voz diz "Happy hour".
Scene 2 (1.0–2.4s): em "aparece sozinha", o celular desliza para a direita e encolhe um pouco, cedendo o centro-esquerda para um relógio 3D creme com ponteiros (svg-icon-enrichment) que gira de 17h até 18h; ao chegar, um anel laranja acende ao redor (a faixa de 18h–20h desenha como arco — stat-bars-and-fills).
Scene 3 (2.4–4.0s): em "no horário que você marcar", o cartão do painel 12-painel-promocoes-cel.png sobe por trás do relógio em perspectiva, mostrando "Ter a Sex · 18h às 20h"; segura parado.

narrativeRole: mostra como o produto aumenta venda em horário fraco sem trabalho.
keyMessage: promoção automática.

## Frame 6 — Curte e pede no WhatsApp

- scene: Toque duplo: um coração laranja explode na tela; a folha de detalhes sobe e o botão verde "Pedir pelo WhatsApp" pulsa e se destaca em camada à frente do celular
- voiceover: "Ele curte, salva os favoritos… e pede direto no seu WhatsApp."
- duration: 3.984s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-pedido.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease
- asset_candidates: assets/02-curtida.png — coração da curtida sobre o hambúrguer; assets/07-detalhes-pedir.png — detalhes do prato com botão verde Pedir pelo WhatsApp; assets/03-conta.png — convite para salvar favoritos com telefone
- blueprint: device-surface-showcase (Adapt)
- focal: assets/07-detalhes-pedir.png
- roles: 02-curtida = tela 1 do celular · 03-conta = tela 2 · 07-detalhes-pedir = tela final (cutout), com o botão verde "Pedir pelo WhatsApp" recortado e erguido em translateZ
- sfx: none

Adapt: o celular avança pela jornada do cliente (curtir → salvar → pedir) e o elemento final LEVANTA da tela sob um spotlight (variante demo-page-scroll-spotlight).
Scene 1 (0.0–0.7s): celular centrado com 02-curtida.png; em "curte", um coração laranja grande pulsa uma vez sobre a tela (spring-pop suave) e pequenos corações sobem em profundidade (finitos).
Scene 2 (0.7–1.8s): em "salva os favoritos", a tela troca para 03-conta.png (folha sobe de baixo, push-up interno); um chip "❤ favoritos salvos" flutua ao lado em primeiro plano.
Scene 3 (1.8–4.1s): em "pede direto", a tela troca para 07-detalhes-pedir.png; o botão verde "Pedir pelo WhatsApp" (recorte do próprio screenshot) LEVANTA da tela em translateZ e escala, sob um spotlight radial que escurece o resto; em "WhatsApp" o botão faz um press-release suave e segura.

narrativeRole: fecha o ciclo do cliente: do desejo ao pedido.
keyMessage: do vídeo ao pedido em um toque.

## Frame 7 — Você no controle

- scene: O painel do dono aparece num notebook/celular em 3D; os números contam (1.486 pessoas, 5.932 vídeos vistos, 214 pedidos pelo WhatsApp); corte para a lista de itens onde a Batata é pausada com um toque
- voiceover: "E você vê tudo no painel: quem abriu, o que mais vendeu. Acabou o prato? Pausa com um toque."
- duration: 5.464s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-painel.html
- type: feature_showcase
- persuasion: Statistical proof
- beat: control + confidence
- asset_candidates: assets/10-painel-resultados-pc.png — painel do dono no computador com números e gráfico; assets/10-painel-resultados-cel.png — painel no celular com números; assets/11-painel-itens-cel.png — lista de itens com Batata pausada e botão Voltar ao cardápio
- blueprint: dataviz-countup (Adapt)
- focal: assets/10-painel-resultados-pc.png
- roles: 10-painel-resultados-pc = painel no notebook/tela grande em perspectiva (cutout, plano médio) · 10-painel-resultados-cel = (reserva, não usar se o pc couber) · 11-painel-itens-cel = celular em primeiro plano no fim (cutout)
- sfx: none

Adapt: os números do próprio painel contam em cartões que saem da tela; o fim troca para a ação "pausar".
Scene 1 (0.0–1.3s): em "painel", o painel 10-painel-resultados-pc.png entra como uma tela grande inclinada (rotateX 12°, rotateY −18°) ocupando o terço superior e o meio; a câmera faz um push curto e pára.
Scene 2 (1.3–2.9s): em "quem abriu", um cartão destacado sai da tela em translateZ com "1.486" contando (counting-dynamic-scale) e rótulo "pessoas abriram"; em "mais vendeu", um segundo cartão sai com "214" e rótulo "pedidos pelo WhatsApp" — os dois em camadas na frente do painel, laranja nos números.
Scene 3 (2.9–5.5s): em "Acabou o prato?", o celular com 11-painel-itens-cel.png entra em primeiro plano à direita, inclinado; zoom-to-target no item "Batata Rústica · Pausado"; em "toque", um anel de toque laranja (ripple) aparece sobre o botão e segura parado.

narrativeRole: o dono vê o retorno e mantém o cardápio sem custo.
keyMessage: dado e controle na mão do dono.

## Frame 8 — Cabe no seu bolso

- scene: Três cartões empilham em camadas 3D, um por vez: "sem app pra baixar", "sem reimprimir cardápio", "pronto em 1 dia"; selo laranja "cabe no seu orçamento"
- voiceover: "Sem app pra baixar. Sem reimprimir cardápio. Pronto em um dia, e cabe no seu orçamento."
- duration: 5.975s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-bolso.html
- type: benefit_highlight
- persuasion: Risk reversal + value stacking
- beat: relief + trust
- asset_candidates:
- blueprint: grid-card-assemble (Adapt)
- focal: tipografia (três cartões)
- roles: (sem assets) — três cartões creme sobre o fundo escuro, ícones simples desenhados (celular riscado, impressora riscada, relógio/calendário)
- sfx: none

Adapt: lista que acumula (1 item por fala), em pilha 3D; é o respiro calmo do vídeo.
Scene 1 (0.0–1.0s): fundo escuro limpo; o primeiro cartão "sem app pra baixar" desliza de baixo e assenta no terço superior, em leve perspectiva (rotateX 8°).
Scene 2 (1.0–2.3s): em "Sem reimprimir cardápio", o segundo cartão assenta abaixo e um pouco à frente (translateZ), o primeiro recua levemente.
Scene 3 (2.3–3.7s): em "Pronto em um dia", o terceiro cartão assenta, com "1 dia" em laranja.
Scene 4 (3.7–5.5s): em "cabe no seu orçamento", um selo circular laranja "cabe no seu orçamento" carimba no canto superior-direito da pilha (escala de 1.2→1, sem bounce) e tudo segura parado.

narrativeRole: derruba a objeção de preço/complexidade do ICP com orçamento curto.
keyMessage: barato e simples de começar.

## Frame 9 — Chama no WhatsApp

- scene: Marca "Cardápio em Vídeo" se monta no centro com a chama laranja; abaixo "por Ideal Automações" e o botão "Chame no WhatsApp"; ao fundo, os cartões dos pratos giram lentamente em órbita
- voiceover: "Cardápio em Vídeo, da Ideal Automações. Chama a gente no WhatsApp."
- duration: 6.061s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/09-cta.html
- type: cta
- persuasion: Urgency-to-act with low commitment
- beat: motivation
- asset_candidates: assets/bacon-duplo.jpg — capa do hambúrguer; assets/chopp-pilsen.jpg — capa do chopp; assets/milkshake-morango.jpg — capa do milkshake; assets/brownie-sorvete.jpg — capa do brownie
- blueprint: logo-assemble-lockup (Adapt — CTA push)
- focal: marca "Cardápio em Vídeo"
- roles: bacon-duplo.jpg / chopp-pilsen.jpg / milkshake-morango.jpg / brownie-sorvete.jpg = capas dos pratos em órbita ao fundo (background, desfocadas ~40%)
- sfx: none

Adapt: sem logo pronto — a marca é tipográfica: uma chama laranja simples (SVG) + "cardápio em vídeo" em Anton; o CTA é um botão-pílula laranja.
Scene 1 (0.0–1.5s): as quatro capas dos pratos entram em profundidade e assentam numa coroa elíptica ao fundo (orbit-3d-entry, sem órbita contínua), desfocadas; ao centro, a chama SVG se desenha (svg-path-draw) e "cardápio em vídeo" monta por per-word reveal quando a voz diz o nome.
Scene 2 (1.5–2.4s): em "Ideal Automações", surge abaixo "por ideal automações" em Plus Jakarta (creme).
Scene 3 (2.4–4.0s): em "Chama a gente no WhatsApp", uma pílula laranja "chame no whatsapp →" sobe e tem a borda desenhada (CTA button-build), com brilho suave atrás.
Scene 4 (4.0–6.2s): segura tudo parado (jitter mínimo nas capas); é o fim do vídeo — saída final: fade para o fundo escuro nos últimos 0.4s.

narrativeRole: transforma interesse em conversa.
keyMessage: próximo passo é uma mensagem.
