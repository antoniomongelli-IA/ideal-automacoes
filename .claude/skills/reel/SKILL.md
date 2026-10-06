---
name: reel
description: Cria um reel vertical 1080x1920 pronto para postar, do gancho ao MP4 renderizado no computador da pessoa. Use quando a pessoa pedir "faz um reel sobre X", vídeo curto, reels para Instagram ou TikTok, roteiro com vídeo pronto, ou quiser transformar uma ideia, dica, lista ou conteúdo em vídeo animado com legenda. Faz uma entrevista curta, escreve gancho e roteiro cena a cena, gera a narração com HyperFrames (voz Kokoro pf_dora, sem ElevenLabs), mixa a trilha e renderiza com HyperFrames.
license: MIT
---

# Reel pronto, renderizado na sua máquina

Com um pedido como "faz um reel sobre 3 erros de quem começa a correr, para o meu perfil de
corrida", você entrega o reel **pronto**: gancho, roteiro cena a cena, narração, trilha e o MP4
vertical 1080x1920, renderizado localmente com HyperFrames. Nada é enviado para app de edição.

O vídeo é tipográfico: fundo escuro com um brilho suave, cenas com título grande, lista
numerada, número animado, cartão de antes/depois e um bloco final "Comenta PALAVRA", com a
legenda aparecendo palavra por palavra no centro, alternando peso forte e itálico.

`<skill>` abaixo é a pasta desta skill (onde está este SKILL.md).

## Pré-requisitos

- **Node 18 ou mais novo** (`node -v`). Obrigatório.
- **ffmpeg** (opcional). Só para nivelar o volume da trilha. Sem ele, a música entra como está.
  Mac: `brew install ffmpeg`. Windows: `winget install ffmpeg`. Linux: `sudo apt install ffmpeg`.
- **HyperFrames** (skills `/hyperframes` instaladas) e **ffmpeg**. Nada de ElevenLabs.

## O fluxo, em 7 passos

### 1. Entrevista rápida (uma mensagem só)

Pergunte tudo de uma vez, com sugestão padrão entre parênteses, para a pessoa responder em uma
linha. Se ela já disse alguma coisa no pedido, não pergunte de novo.

1. **Nicho e perfil**: sobre o que é o perfil?
2. **Público**: quem assiste? (iniciante no assunto)
3. **Objetivo do reel**: alcance, salvar, ou gerar comentário para mandar um material? (comentário)
4. **CTA**: qual palavra a pessoa comenta e o que recebe? (ex.: "Comenta GUIA e eu te mando o guia")
5. **Tom**: direto, didático, provocativo, leve? (direto)
6. **Voz e música**: narração com voz feminina pf_dora (padrão) ou sem voz? Tem uma música (MP3 seu ou de biblioteca livre)?
   Quer cores específicas? (sem voz, sem música, tema escuro com destaque amarelo)


### 2. Gancho e roteiro

Escreva antes de qualquer código e mostre em bloco: gancho, cenas numeradas (tipo + o que
aparece na tela + a fala) e a duração estimada. **Peça ok antes de gerar narração**. Sem narração, pode seguir direto se a pessoa pediu "só faz".

**Gancho (cena 1, até 2 segundos)**
- No máximo 6 ou 7 palavras faladas. Se precisa de mais, não é gancho, é introdução.
- A tela já mostra o gancho inteiro no primeiro quadro (o tipo `gancho` faz isso).
- Formatos que seguram: pergunta com a dor ("Treina todo dia e nada muda?"), afirmação contra
  o senso comum ("Postar todo dia está te atrapalhando"), número concreto ("3 erros que travam
  seu primeiro 5 km"), consequência ("Isso aqui faz você perder cliente no direct").
- Nada de "Oi, gente", "Neste vídeo", "Você sabia" ou apresentação pessoal.

**Roteiro (20 a 45 segundos no total)**
- De 4 a 8 cenas. Cada cena entre 1,5 e 6 segundos: no ritmo de 2,9 palavras por segundo,
  são de 5 a 17 palavras de fala por cena.
- **Fala contínua, não picada.** O texto de todas as cenas, lido em sequência, precisa soar
  como uma pessoa falando sem parar: cada cena continua a frase ou a ideia da anterior. Nada de
  frases de uma palavra, reticências para "dar pausa" ou listas faladas sem verbo. Escreva
  primeiro o texto corrido inteiro e só depois corte nas cenas.
- Uma ideia por cena. A tela mostra a versão curta (título, itens, número); a fala explica.
- Números curtos em dígito na fala ("23 horas", "1,6 grama") para a legenda ficar limpa.
- Promessa só do que é verdade. Não invente estatística: se não tem fonte, use outro tipo de cena.
- **Última cena é sempre `cta`**, e a fala diz a palavra em voz alta ("Comenta GUIA que eu te
  mando o passo a passo").

### 3. Produzir com HyperFrames (no lugar de Remotion + ElevenLabs)

Nesta instalação o reel **não usa Remotion nem ElevenLabs**. Ignore `template/`, `scripts/` e
`.env.exemplo`, e não peça chave nenhuma. Depois do ok no roteiro:

1. Chame a skill `/hyperframes` (roteia para `/faceless-explainer` ou `/general-video`) e crie o
   projeto em `videos/reels/<slug>/` (ou `~/reels-estudio/<slug>/` fora de um repositório),
   formato **9:16, 1080x1920**, com as cenas do roteiro acima. Os tipos de cena da tabela abaixo
   (`gancho`, `titulo`, `lista`, `numero`, `antes-depois`, `cta`) viram cenas HTML/GSAP com
   efeitos 3D e em camadas, no mesmo estilo dos vídeos do Cardápio em Vídeo.
2. **Narração**: Kokoro local, voz **`pf_dora`** (feminina, português do Brasil, entusiasmada),
   via `/media-use` / `npx hyperframes tts`. Gere o texto corrido inteiro de uma vez para a
   entonação sair contínua. Palavras em inglês se escrevem como se falam ("uótsápi",
   "tíque tóque", "i á" para IA, "arroba" para @). Velocidade entre 1,0 e 1,12.
3. **Legenda palavra por palavra**: transcrição/alinhamento pela própria HyperFrames
   (`npx hyperframes transcribe`); se o modelo não baixar, alinhe pelas pausas da narração.
4. **Trilha**: só a que a pessoa fornecer ou uma gerada/resolvida pelo `/media-use` com licença
   livre. Mixe com `/hyperframes-audio`: voz tratada (EQ + compressor), trilha baixa que
   **abaixa sozinha quando há voz** (ducking) e volume final em -14 LUFS.
5. Se a CDN do GSAP estiver bloqueada no render, use o GSAP local em `assets/vendor/`.
6. `npm run check`, olhe 3 quadros (gancho, meio, CTA) com `npx hyperframes snapshot` e
   renderize com `npm run render`.

### 7. Entregar com o checklist

Entregue o **caminho do MP4** (o MP4 em `renders/` do projeto), o roteiro final e a sugestão
de legenda do post. Antes, confirme e diga que conferiu:

- [ ] **Contraste**: a legenda lê bem sobre o fundo (o `npm run check` da HyperFrames mede; mínimo 4,5:1).
- [ ] **Nada parado mais de ~3 s**: nenhuma cena acima de 6 s e nenhuma pausa longa sem legenda.
- [ ] **Gancho em até 2 s**, já visível no primeiro quadro.
- [ ] **CTA no fim**, na tela e na fala, com a palavra certa.
- [ ] Duração entre 20 e 45 s.
- [ ] Com voz: a legenda bate com a fala (veja um trecho do meio no MP4).
- [ ] Os PNGs de prévia em `out/` podem ser apagados.

## Roteiro de cenas (vocabulário para montar as cenas HyperFrames)

```json
{
  "cores": { "fundo": "#0E0F12", "texto": "#F4F4F2", "destaque": "#FFC94A", "suave": "#9A9CA3", "sobreDestaque": "#0E0F12" },
  "fonte": "Inter",
  "fonteItalica": "Instrument Serif",
  "legenda": true,
  "narracao": null,
  "palavras": null,
  "trilha": null,
  "cenas": [
    { "tipo": "gancho", "titulo": "Treina todo dia e nada muda?", "destaque": "nada muda",
      "fala": "Treina todo dia e nada muda?" },
    { "tipo": "titulo", "titulo": "O problema não é o treino.", "subtitulo": "É o que acontece nas outras 23 horas.",
      "fala": "O problema quase nunca é o treino, é o que você faz nas outras 23 horas." },
    { "tipo": "lista", "titulo": "Os 3 vilões",
      "itens": ["Dormir menos de 7 horas", "Comer pouca proteína", "Repetir a mesma carga"],
      "fala": "São três vilões: dormir menos de sete horas, comer pouca proteína e repetir a mesma carga por meses." },
    { "tipo": "numero", "de": 0, "ate": 1.6, "decimais": 1, "sufixo": " g", "rotulo": "de proteína por quilo de peso, por dia",
      "fala": "Uma referência comum para quem treina é 1,6 grama de proteína por quilo, todo dia." },
    { "tipo": "antes-depois", "antes": "Treino novo toda semana", "depois": "Mesmo treino, carga subindo",
      "fala": "Em vez de trocar o treino toda semana, mantenha o mesmo e suba a carga." },
    { "tipo": "cta", "chamada": "Comenta", "palavra": "PLANO", "promessa": "que eu te mando o checklist das 23 horas",
      "fala": "Comenta PLANO que eu te mando o checklist das 23 horas." }
  ]
}
```

O mesmo exemplo está em `<skill>/exemplos/cenas.exemplo.json`.

### Tipos de cena

Todas têm `fala` (obrigatória) e `duracao` em segundos (opcional; só vale sem narração).

| tipo | campos | uso |
|---|---|---|
| `gancho` | `titulo`, `destaque` | Primeira cena. Título enorme; `destaque` é o trecho em itálico na cor de destaque. Se o título é igual à fala, a legenda não repete. |
| `titulo` | `titulo`, `subtitulo`, `destaque` | Uma afirmação forte. Título até ~50 caracteres. |
| `lista` | `titulo`, `itens` (2 a 5) | Itens numerados entrando um a um. Cada item até ~30 caracteres. |
| `numero` | `ate`, `de`, `prefixo`, `sufixo`, `decimais`, `rotulo` | Número que conta até o valor. Ex.: `"prefixo": "R$ "`, `"sufixo": "%"`. |
| `antes-depois` | `antes`, `depois`, `rotuloAntes`, `rotuloDepois` | Dois cartões; o "depois" entra no meio da cena, em destaque. |
| `cta` | `palavra`, `chamada`, `promessa` | Última cena. "Comenta" + PALAVRA num bloco + o que a pessoa recebe. Palavra até 9 letras. |

### Cores e fontes

- `cores`: qualquer cor `#rrggbb`. O padrão é neutro escuro com destaque amarelo. Para tema
  claro, inverta `fundo` e `texto` e escolha um `destaque` escuro o bastante. O `npm run check`
  reprova contraste baixo.
- `fonte` e `fonteItalica`: nomes de famílias do Google Fonts (ex.: `"Montserrat"`,
  `"Playfair Display"`). A `fonte` precisa ter peso 900. Use `"sistema"` para não baixar nada.
  Se a família não existir ou faltar internet, o render segue com a fonte do sistema.
- `legenda: false` desliga a legenda palavra por palavra.

## Problemas comuns

- **Mudou a fala depois de narrar?** Gere a narração e a legenda de novo.
- **Texto saindo da tela**: encurte o título ou os itens; o `npm run check` avisa.
- **Render lento ou travando**: `--concurrency=2`, feche o navegador, e confira o espaço em disco.

## O que esta skill não faz

- Não filma nem usa vídeo gravado, imagem ou avatar: o reel é tipográfico (texto, número,
  cartões). Para editar filmagem, use outra ferramenta.
- Não usa ElevenLabs: a voz é sempre a Kokoro local (pf_dora) da HyperFrames.
- Não escolhe nem baixa música: a trilha é sempre fornecida pela pessoa.
- Não publica no Instagram nem agenda post.
- O ducking é simples (a música baixa quando há fala); não substitui uma mixagem profissional.
