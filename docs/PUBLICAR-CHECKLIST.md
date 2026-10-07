# Checklist para colocar tudo no ar

Marque cada item conforme for fazendo. Os detalhes de cada passo estão nos guias indicados. O que já está pronto no código, os testes cobrem: o build passa e os 21 testes automáticos passam.

---

## 1. Código no ramo principal (5 min)

Todo o trabalho está no ramo `claude/nfc-qr-menu-videos-ao6qaq`. A Vercel publica em produção o que estiver no ramo principal (`main`).

- [ ] Me pedir para abrir o **Pull Request** do ramo para o `main`. Eu abro e você só clica em **Merge** no GitHub.
- [ ] Depois do merge, confirmar na Vercel que o deploy de produção ficou **Ready** (verde).

## 2. Supabase: o banco (15 min)

Guia completo: `docs/cardapio/SUPABASE.md`.

- [ ] Criar o projeto no Supabase, se ainda não tiver. Use a região São Paulo.
- [ ] No **SQL Editor**, rodar nesta ordem:
  1. `supabase/schema.sql`: tabelas do cardápio, segurança e funções.
  2. `supabase/webhook.sql`: avisos para o n8n. Antes, troque o link do webhook pelo seu.
  3. (Opcional) `supabase/seed_demo.sql`: os 3 restaurantes fictícios de demonstração dentro do banco.
  4. `docs/instagram/supabase-instagram.sql`: postagens agendadas e resposta ao AGENTE.
- [ ] Em **Authentication → URL Configuration**, colocar o endereço do site em *Site URL* e em *Redirect URLs*.
- [ ] Anotar em **Project Settings → API**:
  - a **Project URL**;
  - a chave **anon/publishable**, que vai na Vercel;
  - a chave **service_role**, que vai **só no n8n**.

## 3. Vercel: o site (10 min)

- [ ] Em **Settings → Environment Variables**, para *Production* e *Preview*:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | a Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave anon/publishable |
| `NEXT_PUBLIC_SITE_URL` | o endereço final do site (ex.: `https://idealautomacoes.com.br`) |
| `RESEND_API_KEY` | (opcional) só se usar o formulário de contato por e-mail |
| `CONTACT_EMAIL` | (opcional) e-mail que recebe os contatos |

- [ ] Clicar em **Redeploy** para as variáveis valerem.
- [ ] (Opcional) Em **Settings → Domains**, ligar o seu domínio.

## 4. Testar no celular (10 min)

- [ ] Abrir `/cardapio` e ver a vitrine.
- [ ] Abrir `/cardapio/road-house` e passar os pratos: vídeo, preço, detalhes, "Mais pedidos" e "Cardápio".
- [ ] Criar um estabelecimento de teste em `/cardapio/cadastro`, subir uma logo e ver as cores aplicadas.
- [ ] No painel, pausar um item e conferir que ele some do cardápio. Depois, despausar.
- [ ] Criar uma promoção com horário e ver o preço riscado aparecer.
- [ ] Testar "esqueci a senha": o código precisa chegar no WhatsApp pelo n8n.

## 5. n8n (15 min)

- [ ] Importar `docs/cardapio/n8n-avisos.json`: boas-vindas, código de senha e erros do site.
- [ ] Importar os 2 workflows do Instagram (`docs/instagram/`) e seguir o `COMO-CONFIGURAR.md`.
- [ ] Ativar todos os workflows.

## 6. Road House: apresentação (no dia)

- [ ] Mandar o vídeo `videos/reels/video-road-house/video-road-house-narrado.mp4` no WhatsApp do dono ou do gerente.
- [ ] Mandar junto o link da demo: `https://SEU-SITE/cardapio/road-house`.
- [ ] Pedir os originais: **logo em alta** e **fotos ou vídeos dos pratos**. A demo usa recortes de prints, em baixa resolução.
- [ ] Se fecharem: cadastrar a Road House pelo cadastro normal, que fica no banco e é editável pelo painel, e gerar as placas de QR Code e NFC pelo painel.

---

**Dica:** o vídeo de apresentação da Ideal Automações (`videos/reels/video-ideal-automacoes/`) serve para mandar a qualquer lead que pediu o diagnóstico. Mande antes da conversa.
