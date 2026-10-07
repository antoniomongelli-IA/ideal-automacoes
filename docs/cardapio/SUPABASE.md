# Ligando o cardápio ao banco (Supabase) · passo a passo

Tempo: uns 15 minutos. Você não precisa saber programar: é copiar, colar e clicar.

Enquanto o banco não estiver ligado, o site continua funcionando com os 3 restaurantes de demonstração.

---

## 1. Criar o projeto no Supabase

1. Entre em **https://supabase.com** e crie a conta (pode ser com o GitHub).
2. Clique em **New project**.
   - **Name**: `cardapio-em-video`
   - **Database password**: crie uma senha forte e **guarde** (não vamos usar agora, mas é a senha mestra do banco).
   - **Region**: **South America (São Paulo)**, para ficar rápido no Brasil.
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Criar as tabelas (rodar o SQL)

1. No menu da esquerda, abra **SQL Editor** → **New query**.
2. Abra o arquivo [`supabase/schema.sql`](../../supabase/schema.sql), copie **tudo** e cole no editor.
3. Clique em **Run**. Deve aparecer “Success. No rows returned”.
4. (Opcional) Para ter os 3 restaurantes de demonstração no banco, faça o mesmo com [`supabase/seed_demo.sql`](../../supabase/seed_demo.sql).

Pode rodar o `schema.sql` de novo no futuro (quando houver atualização): ele não apaga dados.

## 3. Ajustar o login

1. Menu **Authentication** → **Sign In / Providers** → **Email**.
2. **Desligue “Confirm email”** e salve.
   Por quê: o cliente final cria conta só com telefone e senha. Sem isso, o Supabase tentaria mandar um e-mail de confirmação.
3. Menu **Authentication** → **URL Configuration** → **Site URL**: coloque o endereço do site (ex.: `https://seusite.com.br`).

## 4. Pegar as duas chaves

Menu **Project Settings** (engrenagem) → **API Keys** / **Data API**:

| Nome no Supabase | Para onde vai |
|---|---|
| **Project URL** (ex.: `https://abcd.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / publishable key** (texto longo) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> A chave **service_role / secret** **não** é usada e **nunca** deve ir para o site.

## 5. Colocar as chaves na Vercel

1. Vercel → projeto **ideal-automacoes** → **Settings** → **Environment Variables**.
2. Adicione as duas variáveis do passo 4, marcando **Production** e **Preview**.
3. Vá em **Deployments**, abra o último e clique em **Redeploy**.

(Para testar no seu computador, copie `.env.local.example` para `.env.local` e preencha.)

## 6. Testar

1. Abra `seusite/cardapio/cadastro` e crie um estabelecimento de teste.
2. No painel (`/cardapio/painel`) adicione um item com foto ou vídeo.
3. Abra `seusite/cardapio/<link-do-teste>` no celular, curta um item e veja o número aparecer em **Resultados**.

## 7. Virar administrador (ver e editar todos os clientes)

No **SQL Editor**, rode (trocando o e-mail pelo seu, já cadastrado no site):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'seu@email.com';
```

Como admin, no painel aparece uma lista para escolher qualquer estabelecimento.

## 8. Aviso no webhook (n8n) a cada cadastro

No **SQL Editor**, rode o arquivo [`supabase/webhook.sql`](../../supabase/webhook.sql) (copie pelo botão “Copy raw file” do GitHub).
A partir daí, o banco manda um POST em JSON para o webhook:

- `"evento": "novo_estabelecimento"` → nome, slug, link, nicho, cidade, WhatsApp, Instagram e e-mail do dono.
- `"evento": "novo_cliente"` → nome, telefone (sempre 55 + DDD + número), de qual estabelecimento veio, o item que curtiu/compartilhou, os links e `aceita_mensagens` (só mande mensagem se for `true`).
- `"evento": "recuperar_senha"` → alguém tocou em “Esqueci minha senha”: telefone e o `codigo` de 6 números para mandar no WhatsApp. Cliente final recebe no próprio telefone; dono recebe no WhatsApp do estabelecimento.
- `"evento": "erro_cardapio"` → o site deu erro no celular de alguém (página, erro, celular, versão). No máximo 1 aviso por erro igual a cada hora.

Se o webhook estiver fora do ar, o cadastro continua funcionando normalmente (o aviso só é perdido).
Para ver se os avisos saíram: **Database → Extensions → pg_net**, ou rode `select * from net._http_response order by created desc limit 10;`.

## 9. Fluxo pronto no n8n (código de senha, aceite e erros)

1. Abra o arquivo [`docs/cardapio/n8n-avisos.json`](n8n-avisos.json) no GitHub e copie com o botão **“Copy raw file”**.
2. No n8n, abra o fluxo que já tem o Webhook do cardápio, clique numa área vazia e aperte **Ctrl+V** (no Mac, Cmd+V). Os nós aparecem colados.
3. Ligue a saída do seu **Webhook** na entrada do nó **Tipo de aviso**.
4. Saída **Boas-vindas** → ligue no seu fluxo de boas-vindas que já existe (ela só deixa passar quem marcou “Aceito receber mensagens”).
5. Nos nós **Enviar … no WhatsApp**, troque endereço, instância e apikey pelos da sua API de WhatsApp (ou apague e use o seu nó de envio com `{{ $json.telefone }}` e `{{ $json.mensagem }}`).
6. No nó **Mensagem de erro**, troque `MEU_NUMERO` pelo seu WhatsApp (55 + DDD + número).
7. Salve e deixe o fluxo **ativo**.

Para ver os erros guardados no banco: **SQL Editor** → `select criado_em, pagina, mensagem, navegador from erros order by criado_em desc limit 50;`

---

## Como ficam as fotos e os vídeos

- Ficam no **Storage** do Supabase, no “balde” **midia** (o SQL já cria). Cada estabelecimento tem a própria pasta.
- O dono envia pelo painel, direto do celular. Antes de enviar, o próprio aparelho:
  - **reduz a foto** (máx. 1440 px, JPEG), para carregar rápido;
  - **tira a capa do vídeo** (um quadro do começo), que aparece enquanto o vídeo carrega;
  - **confere se o vídeo abre**. Se não abrir, avisa para gravar em formato compatível.
- Limite por vídeo: **50 MB** (limite do plano grátis). Um vídeo vertical de 10 a 20 s em 1080p fica em 5 a 25 MB.
- **iPhone**: em Ajustes › Câmera › Formatos, use **“Mais Compatível”**. Assim o vídeo sai em MP4 (H.264), que toca em qualquer celular.
- Ao trocar ou apagar um item, os arquivos antigos são apagados do Storage.

### Custos (o ponto de atenção é o vídeo)

O que pesa é a **banda** (cada vez que alguém assiste, o vídeo é baixado). Confira os valores atuais em supabase.com/pricing. A referência hoje:

| Plano | Arquivos guardados | Banda por mês | Preço |
|---|---|---|---|
| Free | 1 GB | 5 GB | grátis |
| Pro | 100 GB | 250 GB | US$ 25/mês |

Conta rápida: uma pessoa que vê 10 vídeos baixa uns 20 a 40 MB. No plano grátis dá para umas **150 a 250 visitas por mês** no total: bom para testar e mostrar, **pouco para clientes reais**.

**Recomendação:** para os primeiros clientes, plano **Pro** (US$ 25 cobre vários restaurantes). Quando passar de uns 10 clientes, migramos os vídeos para um serviço de vídeo (Bunny Stream ou Cloudflare Stream), que comprime e entrega vídeo bem mais barato. O resto do sistema não muda.

---

## Como funcionam curtidas, favoritos e a conta do cliente

- **Curtir** (❤️ ou dois toques no vídeo) soma na contagem do item **na hora**, sem pedir cadastro. Cada celular conta uma vez por item.
- Na **primeira curtida** (e no primeiro compartilhamento), aparece uma vez o convite “Salve seus favoritos”: nome, telefone e senha. É opcional.
- Quem fica **2 minutos** no cardápio sem conta também recebe o convite (uma vez por celular).
- A caixinha **“Aceito receber mensagens no WhatsApp”** já vem marcada; a pessoa pode desmarcar. Vai no aviso do webhook como `aceita_mensagens`.
- **Esqueci minha senha**: a pessoa digita o telefone, recebe um código de 6 números no WhatsApp (vale 10 minutos, até 5 tentativas e 5 pedidos por dia) e cria a senha nova. O dono faz o mesmo em `/cardapio/entrar`, com o e-mail; o código vai para o WhatsApp do estabelecimento.
- O botão ❤️ no topo mostra **Meus favoritos**. Com conta, os favoritos aparecem em qualquer celular, em qualquer visita.
- Nada é enviado por SMS ou e-mail: o login do cliente é telefone + senha.
- O telefone é sempre salvo como **55 + DDD + número**, só dígitos (ex.: `5567999998888`), pronto para o WhatsApp. O campo já mostra o +55 fixo; a pessoa digita só DDD e número.

## Promoções, pedidos e avaliações

- **Pausar item** (aba Itens): o item some do cardápio sem ser apagado. “Voltar ao cardápio” traz de volta.
- **Promoções** (aba Promoções): nome, item (opcional), preço promocional, dias da semana e horário. Só aparecem no horário marcado: aviso no topo e o preço promocional no item (com o preço normal riscado).
- **Pedir pelo WhatsApp** (aba Dados do local): botão “Pedir” em cada item, que abre o WhatsApp do estabelecimento com o nome do item, o preço e o link.
- **Avalie no Google** (aba Dados do local): cole o link de avaliação; depois de 5 minutos no cardápio aparece o convite (no máximo 1 vez por mês por celular).

## Link de cada item

Ao tocar em **Enviar** num item, o link compartilhado é `…/cardapio/<estabelecimento>?item=<id do item>`.
Quem abre esse link cai **direto nesse item**, e a prévia no WhatsApp mostra a foto e o nome do item.

## Como os números do painel são contados

O cardápio registra eventos anônimos (sem nome nem telefone) e o banco soma:

| No painel | O que conta |
|---|---|
| Pessoas que abriram | celulares diferentes que abriram o cardápio no período |
| Vídeos assistidos | quando alguém para pelo menos 1 segundo num item |
| Curtidas | curtidas novas no período (curtir duas vezes não soma) |
| Compartilhamentos | toques em “Enviar” num item |
| Pedidos pelo WhatsApp | toques no botão “Pedir” |
| Cliques em “Avaliar no Google” | toques no convite de avaliação |
| Itens mais assistidos | ranking por vídeos assistidos |
| Horários de mais movimento | horas do dia em que mais gente abre o cardápio |
| Clientes com conta | quantas pessoas criaram conta para guardar favoritos |

Cada número vem com a comparação com o período anterior (7, 30 ou 90 dias).

A aba **Mais pedidos** usa as **vendas do mês** que o dono informa em cada item (vêm do caixa). Se nenhuma venda for informada, a aba vira **Em alta** e ordena por vídeos assistidos + curtidas, automaticamente.
