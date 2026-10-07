# Instagram no automático: postagem agendada + resposta ao "AGENTE"

São três arquivos nesta pasta:

| Arquivo | Para que serve |
|---|---|
| `supabase-instagram.sql` | Cria a fila de posts, as palavras-chave e o histórico de comentários. |
| `n8n-instagram-postagens.json` | Publica sozinho os posts da fila na hora marcada. |
| `n8n-instagram-comentarios.json` | Responde quem comentar **AGENTE**: uma resposta pública e outra no direct. |

---

## Passo 1. Supabase (5 min)

1. No Supabase, vá em **SQL Editor**, cole todo o conteúdo de `supabase-instagram.sql` e clique em **Run**.
2. Em **Storage**, deve aparecer a pasta **instagram**, que é pública. É nela que você sobe os arquivos dos posts.
3. Anote dois dados em **Project Settings → API**:
   - o **Project URL**;
   - a chave **service_role**. Ela é secreta: use só no n8n e nunca coloque no site.

---

## Passo 2. Meta for Developers (20 a 30 min, uma vez só)

Você já tem conta profissional ligada a uma Página e já criou um app. Falta conferir o seguinte:

1. **Produtos do app.** Em **developers.facebook.com → Meus apps → seu app**, adicione:
   - **Instagram**, na opção *"API com login do Facebook"* (*API setup with Facebook login*);
   - **Webhooks**.
2. **Gerar o token.** Abra o **Graph API Explorer** (menu *Ferramentas*):
   1. Selecione o seu app.
   2. Em *User or Page*, escolha *Get User Access Token* e marque as permissões:
      `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `business_management`.
   3. Clique em **Generate Access Token** e aceite tudo, escolhendo a sua Página e o seu Instagram.
3. **Transformar em token que não expira.**
   1. Em **Ferramentas → Depurador de token de acesso**, cole o token e clique em **Estender token de acesso**. Copie o token longo que aparecer.
   2. De volta ao Graph API Explorer, cole esse token longo e faça um GET em:
      `me/accounts?fields=id,name,access_token,instagram_business_account`
   3. A resposta traz os 3 dados que você precisa:

| Campo na resposta | Onde vai no nó **Configuração** |
|---|---|
| `id` | **PAGE_ID** |
| `access_token` | **TOKEN_META** (é o token da Página, que não expira) |
| `instagram_business_account.id` | **IG_USER_ID** |

4. **Webhook dos comentários.** Faça só depois do Passo 3.
   1. No app, vá em **Webhooks**, escolha o objeto **Instagram** e clique em **Assinar este objeto**.
   2. Em **URL de retorno de chamada**, cole a *Production URL* do nó **Instagram avisa (POST)**.
   3. Em **Verificar token**, coloque `ideal-agente-2026`, o mesmo que está no nó *Conferir token*.
   4. Clique em **Verificar e salvar** e depois assine o campo **comments**.
5. **Ligar a Página ao app.** No Graph API Explorer, com o token da Página, faça um POST em:
   `{PAGE_ID}/subscribed_apps?subscribed_fields=feed`
   A resposta precisa ser `{"success": true}`.
6. **Modo do app.** Enquanto o app estiver em **Desenvolvimento**, os avisos de comentário só chegam de contas que têm função no app (você e quem você adicionar como testador). Para funcionar com qualquer pessoa:
   - coloque o app em **Ao vivo**. Pede um link de política de privacidade, que pode ser uma página simples no seu site;
   - para o **direct automático** chegar a qualquer pessoa, a permissão `instagram_manage_messages` precisa de **Acesso avançado**, que se pede na *Análise do app*. Até lá, a resposta pública já funciona e o direct falha só para quem não é testador. O erro fica registrado na tabela.

---

## Passo 3. n8n (5 min)

1. Importe os dois arquivos: **Workflows → Import from file**.
2. Nos dois workflows, abra o nó **Configuração** e preencha `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TOKEN_META`, `IG_USER_ID` e `PAGE_ID`.
3. Ative os dois workflows (chave **Active**).
4. No workflow de comentários, copie a **Production URL** do nó **Instagram avisa (POST)** e use no Passo 2.4.

---

## Como agendar um post

1. **Suba os arquivos** no Storage, na pasta **instagram**.
   - Carrossel: use as versões **.jpg**, que estão em `conteudo/instagram/carrossel-*/jpg/`. A API do Instagram não aceita PNG.
   - Reel: o **.mp4**.
2. Clique no arquivo e em **Get URL** para copiar o link público.
3. **Coloque na fila.** No **SQL Editor**, use os exemplos do fim do `supabase-instagram.sql`. O horário vai com `-04:00`, que é o horário de MS.
4. A cada 5 minutos o n8n verifica a fila e publica o que estiver na hora. O link do post aparece na coluna `permalink`.

**Se der erro:** ele tenta de novo mais 2 vezes, com 10 minutos de intervalo. Depois disso, o motivo fica na coluna `erro`.

**Limites do Instagram:** até 50 posts por dia pela API. Carrossel de 2 a 10 imagens. Reel de 3 segundos a 15 minutos.

---

## Como testar a resposta ao AGENTE

1. Com tudo ativo, comente **AGENTE** em um post seu, usando outra conta que seja testadora do app.
2. Em alguns segundos devem acontecer duas coisas: a resposta "Te chamei no direct!" e a mensagem no direct.
3. Confira na tabela `instagram_comentarios`. As colunas `respondido_publico` e `direct_enviado` devem estar como `true`.

**Para mudar textos ou criar outras palavras:** edite a tabela `instagram_palavras`. Por exemplo, para uma palavra GUIA que manda um material. O nome da pessoa entra no lugar de `{nome}`.
