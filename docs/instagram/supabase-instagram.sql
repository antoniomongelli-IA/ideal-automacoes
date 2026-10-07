-- =====================================================================
-- Instagram @ia.antoniomongelli: postagens agendadas + resposta ao "AGENTE"
-- Cole tudo no Supabase > SQL Editor > Run. Pode rodar de novo sem problema.
-- Quem lê e escreve nessas tabelas é só o n8n (com a chave service_role).
-- =====================================================================

-- ---------- 1. Pasta pública para as mídias (imagens .jpg e reels .mp4) ----------
insert into storage.buckets (id, name, public)
values ('instagram', 'instagram', true)
on conflict (id) do update set public = true;

-- ---------- 2. Fila de postagens ----------
create table if not exists public.instagram_posts (
  id             uuid primary key default gen_random_uuid(),
  agendado_para  timestamptz not null,
  tipo           text not null check (tipo in ('imagem', 'carrossel', 'reel')),
  legenda        text not null default '',
  midias         text[] not null,           -- links públicos, na ordem (carrossel: 2 a 10 .jpg)
  capa_url       text,                      -- opcional, só para reel (.jpg)
  status         text not null default 'agendado'
                 check (status in ('agendado', 'publicando', 'publicado', 'erro', 'pausado')),
  tentativas     int not null default 0,
  media_id       text,
  permalink      text,
  erro           text,
  criado_em      timestamptz not null default now(),
  publicado_em   timestamptz,
  constraint instagram_posts_midias_ok check (
    (tipo = 'imagem'    and cardinality(midias) = 1) or
    (tipo = 'reel'      and cardinality(midias) = 1) or
    (tipo = 'carrossel' and cardinality(midias) between 2 and 10)
  )
);
create index if not exists instagram_posts_fila on public.instagram_posts (status, agendado_para);

-- ---------- 3. Palavras-chave dos comentários ----------
create table if not exists public.instagram_palavras (
  palavra          text primary key,        -- sempre em MAIÚSCULAS, sem acento
  respostas        text[] not null,         -- resposta pública (sorteia uma, para não parecer robô)
  mensagem_direct  text not null,           -- o direct; use {nome} para o @ da pessoa
  ativa            boolean not null default true
);

insert into public.instagram_palavras (palavra, respostas, mensagem_direct) values (
  'AGENTE',
  array[
    'Te chamei no direct! 🚀',
    'Acabei de te mandar no direct, confere lá!',
    'Mandei no seu direct agora mesmo 👊',
    'Te enviei no direct, dá uma olhada!'
  ],
  'Fala, {nome}! Vi que você comentou AGENTE 🙌

Bora marcar seu diagnóstico grátis? É uma conversa rápida, de uns 20 minutos, por vídeo ou ligação. Eu olho como seu WhatsApp atende hoje e te mostro onde dá pra colocar um agente de IA.

Qual dia e horário ficam melhor pra você essa semana? Pode responder assim: "quinta, 10h" 😉'
)
on conflict (palavra) do nothing;

-- ---------- 4. Histórico de comentários respondidos (evita responder 2x) ----------
create table if not exists public.instagram_comentarios (
  comment_id          text primary key,
  media_id            text,
  username            text,
  texto               text,
  palavra             text,
  respondido_publico  boolean not null default false,
  direct_enviado      boolean not null default false,
  erro                text,
  criado_em           timestamptz not null default now()
);

-- ---------- 5. Segurança: ninguém de fora acessa ----------
alter table public.instagram_posts       enable row level security;
alter table public.instagram_palavras    enable row level security;
alter table public.instagram_comentarios enable row level security;
-- (sem políticas = só a service_role do n8n enxerga)

-- ---------- 6. Funções que o n8n chama ----------

-- Pega até 3 posts cuja hora chegou e marca como "publicando" (não pega o mesmo 2x).
create or replace function public.instagram_pegar_posts_devidos()
returns setof public.instagram_posts
language sql
security definer
set search_path = public
as $$
  update public.instagram_posts p
     set status = 'publicando', tentativas = p.tentativas + 1, erro = null
   where p.id in (
     select id from public.instagram_posts
      where status = 'agendado' and agendado_para <= now()
      order by agendado_para
      limit 3
      for update skip locked
   )
  returning p.*;
$$;

-- Marca o resultado da publicação. Se deu erro e ainda tem tentativa, volta para a fila.
create or replace function public.instagram_marcar_post(
  p_id uuid, p_ok boolean, p_media_id text default null, p_permalink text default null, p_erro text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.instagram_posts
     set status       = case when p_ok then 'publicado'
                             when tentativas < 3 then 'agendado'
                             else 'erro' end,
         agendado_para = case when p_ok or tentativas >= 3 then agendado_para
                              else now() + interval '10 minutes' end,
         media_id     = coalesce(p_media_id, media_id),
         permalink    = coalesce(p_permalink, permalink),
         erro         = p_erro,
         publicado_em = case when p_ok then now() else publicado_em end
   where id = p_id;
$$;

-- Registra um comentário. Devolve TRUE só na primeira vez (se já existe, devolve FALSE).
create or replace function public.instagram_registrar_comentario(
  p_comment_id text, p_media_id text, p_username text, p_texto text, p_palavra text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.instagram_comentarios (comment_id, media_id, username, texto, palavra)
  values (p_comment_id, p_media_id, p_username, p_texto, p_palavra);
  return true;
exception when unique_violation then
  return false;
end;
$$;

create or replace function public.instagram_atualizar_comentario(
  p_comment_id text, p_publico boolean, p_direct boolean, p_erro text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.instagram_comentarios
     set respondido_publico = p_publico, direct_enviado = p_direct, erro = p_erro
   where comment_id = p_comment_id;
$$;

-- Só a service_role (n8n) pode chamar essas funções.
revoke all on function public.instagram_pegar_posts_devidos()                                   from public, anon, authenticated;
revoke all on function public.instagram_marcar_post(uuid, boolean, text, text, text)            from public, anon, authenticated;
revoke all on function public.instagram_registrar_comentario(text, text, text, text, text)      from public, anon, authenticated;
revoke all on function public.instagram_atualizar_comentario(text, boolean, boolean, text)      from public, anon, authenticated;
grant execute on function public.instagram_pegar_posts_devidos()                                to service_role;
grant execute on function public.instagram_marcar_post(uuid, boolean, text, text, text)         to service_role;
grant execute on function public.instagram_registrar_comentario(text, text, text, text, text)   to service_role;
grant execute on function public.instagram_atualizar_comentario(text, boolean, boolean, text)   to service_role;

-- =====================================================================
-- EXEMPLOS DE AGENDAMENTO (horário de Mato Grosso do Sul = -04:00)
-- Troque SEU-PROJETO pelo código do seu projeto Supabase.
-- =====================================================================
-- Reel:
-- insert into public.instagram_posts (agendado_para, tipo, legenda, midias) values (
--   '2026-10-14 19:00-04:00', 'reel',
--   'Sua legenda aqui...',
--   array['https://SEU-PROJETO.supabase.co/storage/v1/object/public/instagram/reel-23h-narrado.mp4']
-- );
--
-- Carrossel (só .jpg, na ordem):
-- insert into public.instagram_posts (agendado_para, tipo, legenda, midias) values (
--   '2026-10-15 12:00-04:00', 'carrossel',
--   'Sua legenda aqui...',
--   array[
--     'https://SEU-PROJETO.supabase.co/storage/v1/object/public/instagram/quanto-custa/slide-01.jpg',
--     'https://SEU-PROJETO.supabase.co/storage/v1/object/public/instagram/quanto-custa/slide-02.jpg'
--   ]
-- );
--
-- Ver a fila:      select agendado_para, tipo, status, erro, permalink from public.instagram_posts order by agendado_para;
-- Pausar um post:  update public.instagram_posts set status = 'pausado' where id = '...';
-- Nova palavra:    insert into public.instagram_palavras (palavra, respostas, mensagem_direct) values ('GUIA', array['Te mandei no direct!'], 'Oi {nome}! Aqui está o guia: ...');
