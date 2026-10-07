# Prompts para gerar os carrosséis

**Onde usar:** no Claude Code, dentro deste projeto, onde a skill `carrossel` já está instalada. Também funciona no Claude do navegador, se a skill estiver ativa.

**Como usar:**
1. Copie o prompt inteiro e cole no Claude.
2. Se quiser a sua foto na capa, anexe uma foto sua com fundo limpo junto com o prompt.
3. O Claude devolve os PNGs em 1080x1350, prontos para subir na ordem.

---

## Prompt 1: "Como um agente de IA atende no seu WhatsApp" (Qui 08)

```
Use a skill carrossel. A entrevista já está respondida abaixo; pule direto para a copy e me mostre a tabela só se algo estiver faltando. Depois gere o HTML e exporte os PNGs.

Perfil: @ia.antoniomongelli (Antonio Mongelli | Agentes de IA no WhatsApp)
Nicho: agentes de IA que atendem, qualificam e vendem no WhatsApp de empresas.
Público: dono de pequena e média empresa que vende pelo WhatsApp e perde cliente por demora.
Objetivo: ser salvo e gerar comentário.
CTA (único): Comenta AGENTE e eu te mando um diagnóstico grátis.
Formato: Passo a passo, 8 slides.

Identidade visual (obrigatória):
- Fundo #070B1A com grade fina ciano (rgba(63,200,255,0.06)) e brilhos radiais azul #1F6BFF e roxo #8A3FFC nos cantos
- Cartões #0E1630 com borda rgba(63,200,255,0.35) e cantos de 36px
- Destaque principal #3FC8FF; destaque secundário #D35BFF; texto #F5F7FF; apoio #9AA3B8
- Botão/CTA com gradiente #1F6BFF → #8A3FFC → #C13BFF
- Fonte: Plus Jakarta Sans (800 nos títulos, 500 no texto)
- Se eu anexar foto, use na capa, recortada à direita, ocupando ~45% da largura

Copy:
1. CAPA: "O que acontece quando seu cliente chama no WhatsApp... e quem responde é uma IA?" | apoio: "6 passos, do 'oi' até a venda." | "Arrasta pro lado →"
2. PASSO 1 — "Responde na hora": "Seja 14h ou 23h, o cliente recebe resposta em segundos. Ninguém fica no vácuo."
3. PASSO 2 — "Entende o que ele quer": "Não é menu de 1, 2, 3. Ela lê o que o cliente escreveu, do jeito que ele escreveu."
4. PASSO 3 — "Faz as perguntas certas": "Uma por uma, como um bom vendedor: o que procura, pra quando, quanto quer investir."
5. PASSO 4 — "Mostra o produto": "Consulta o catálogo e manda foto e vídeo do produto certo, na hora."
6. PASSO 5 — "Entrega pronto pro vendedor": "Cliente decidido? O vendedor recebe o resumo da conversa e só entra pra fechar."
7. SALVAR — título "Resumo pra salvar" | checklist: Responde na hora · Entende o cliente · Qualifica sozinha · Mostra foto e vídeo · Passa o cliente pronto | "Salva pra lembrar do que seu WhatsApp pode fazer."
8. CTA — "Quer isso no seu WhatsApp?" | bloco grande "Comenta AGENTE" | "e eu te mando um diagnóstico grátis." | "@ia.antoniomongelli"
```

---

## Prompt 2: "Quanto custa uma mensagem sem resposta" (Seg 12)

```
Use a skill carrossel. A entrevista já está respondida abaixo; pule direto para a copy e me mostre a tabela só se algo estiver faltando. Depois gere o HTML e exporte os PNGs.

Perfil: @ia.antoniomongelli (Antonio Mongelli | Agentes de IA no WhatsApp)
Nicho: agentes de IA que atendem, qualificam e vendem no WhatsApp de empresas.
Público: dono de pequena e média empresa que vende pelo WhatsApp.
Objetivo: ser salvo e gerar comentário.
CTA (único): Comenta AGENTE que eu faço essa conta com você.
Formato: Erro comum com conta, 8 slides.

Identidade visual (obrigatória):
- Fundo #070B1A com grade fina ciano (rgba(63,200,255,0.06)) e brilhos radiais azul #1F6BFF e roxo #8A3FFC nos cantos
- Cartões #0E1630 com borda rgba(63,200,255,0.35) e cantos de 36px
- Destaque principal #3FC8FF; dor/alerta #FF4D7E; destaque secundário #D35BFF; texto #F5F7FF; apoio #9AA3B8
- Botão/CTA com gradiente #1F6BFF → #8A3FFC → #C13BFF
- Fonte: Plus Jakarta Sans (800 nos títulos, 500 no texto)
- Números grandes em ciano; o resultado "perdido" em #FF4D7E

Copy:
1. CAPA: "Quanto custa uma mensagem sem resposta no seu WhatsApp?" | apoio: "Faz essa conta comigo. Vai doer." | "Arrasta pro lado →"
2. "O erro": "Achar que mensagem sem resposta é só uma mensagem. Do outro lado tinha alguém querendo comprar."
3. "Passo 1 — Conte": "Quantas mensagens chegam por semana fora do horário ou sem resposta rápida? Anota esse número."
4. "Passo 2 — Estime": "De cada 5 pessoas que chamam, quantas costumam comprar? Use o seu número real."
5. "Passo 3 — Multiplique": cartão com a fórmula: "mensagens sem resposta × quem compraria × seu ticket médio = venda perdida por semana"
6. "Exemplo (números ilustrativos)": "20 mensagens × 1 em 5 compra × R$ 150 = R$ 600 por semana. Em um mês: cerca de R$ 2.400." | nota pequena: "Exemplo. Faça com os seus números."
7. SALVAR — "Resumo pra salvar" | checklist: Conte as mensagens sem resposta · Veja quantas viram venda · Multiplique pelo ticket · Esse é o valor que fica na mesa | "Salva e refaz essa conta todo mês."
8. CTA — "Quer descobrir o seu número?" | bloco grande "Comenta AGENTE" | "que eu faço essa conta com você." | "@ia.antoniomongelli"
```

---

## Prompt modelo para próximos carrosséis

```
Use a skill carrossel. Perfil @ia.antoniomongelli, nicho agentes de IA no WhatsApp para pequenas e médias empresas, público dono de empresa que vende pelo WhatsApp.
Tema: [TEMA]
Formato: [Lista | Passo a passo | Erro comum | Antes e depois | História]
Objetivo: [ser salvo | gerar comentário | levar ao link]
CTA único: Comenta AGENTE e eu te mando um diagnóstico grátis.
Identidade visual: fundo #070B1A com grade ciano sutil e brilhos azul #1F6BFF / roxo #8A3FFC; cartões #0E1630; destaque #3FC8FF; secundário #D35BFF; alerta #FF4D7E; texto #F5F7FF; CTA em gradiente #1F6BFF→#8A3FFC→#C13BFF; fonte Plus Jakarta Sans 800/500.
Não invente números: se precisar de prova, deixe [PREENCHER].
```
