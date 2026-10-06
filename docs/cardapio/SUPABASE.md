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
- Na **primeira curtida**, aparece uma vez o convite “Salve seus favoritos”: nome, telefone e senha. É opcional.
- O botão ❤️ no topo mostra **Meus favoritos**. Com conta, os favoritos aparecem em qualquer celular, em qualquer visita.
- Nada é enviado por SMS ou e-mail: o login do cliente é telefone + senha.

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
| Itens mais assistidos | ranking por vídeos assistidos |
| Horários de mais movimento | horas do dia em que mais gente abre o cardápio |
| Clientes com conta | quantas pessoas criaram conta para guardar favoritos |

Cada número vem com a comparação com o período anterior (7, 30 ou 90 dias).

A aba **Mais pedidos** usa as **vendas do mês** que o dono informa em cada item (vêm do caixa). Se nenhuma venda for informada, a aba vira **Em alta** e ordena por vídeos assistidos + curtidas, automaticamente.
