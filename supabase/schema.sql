-- =====================================================================
--  Cardápio em Vídeo · estrutura do banco (Supabase)
--
--  Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
--  Pode rodar de novo sem problema: o script não apaga dados existentes.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------

-- Pessoas da sua equipe que podem ver e editar qualquer estabelecimento.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Cada cliente seu (restaurante, bar, açaíteria...).
create table if not exists public.estabelecimentos (
  id            uuid primary key default gen_random_uuid(),
  dono_id       uuid references auth.users (id) on delete set null,  -- quem faz login no painel
  slug          text not null unique,                                -- vira o link: /cardapio/<slug>
  nome          text not null,
  nicho         text not null default 'restaurante',
  cidade        text,
  endereco      text,
  horario       text,
  instagram     text,
  whatsapp      text,
  branding      jsonb not null default '{}'::jsonb,                  -- cores, fontes, arredondamento
  logo_url      text,
  ativo         boolean not null default true,                       -- false = cardápio fora do ar
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint slug_formato check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  constraint slug_reservado check (slug not in ('painel', 'cadastro', 'entrar', 'admin', 'favoritos', 'api', 'demo'))
);

create table if not exists public.categorias (
  id                 uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid not null references public.estabelecimentos (id) on delete cascade,
  nome               text not null,
  emoji              text not null default '🍽️',
  ordem              int  not null default 0
);
create index if not exists categorias_est on public.categorias (estabelecimento_id, ordem);

create table if not exists public.itens (
  id                   uuid primary key default gen_random_uuid(),
  estabelecimento_id   uuid not null references public.estabelecimentos (id) on delete cascade,
  categoria_id         uuid references public.categorias (id) on delete set null,
  nome                 text not null,
  descricao            text not null default '',
  preco                numeric(10, 2) not null default 0 check (preco >= 0),
  preco_antigo         numeric(10, 2) check (preco_antigo is null or preco_antigo >= 0),
  video_url            text,              -- vídeo vertical (opcional)
  poster_url           text,              -- capa do vídeo (gerada no upload)
  foto_url             text,              -- foto (usada quando não há vídeo)
  tags                 text[] not null default '{}',   -- ex.: {vegetariano, +18, picante}
  serve                text,              -- ex.: "2 pessoas"
  tempo_preparo        text,              -- ex.: "15 min"
  destaque_mes         boolean not null default false,
  nota_chef            text,
  combina_com          uuid references public.itens (id) on delete set null,
  pedidos_mes          int not null default 0 check (pedidos_mes >= 0),          -- vendas do mês (opcional)
  pedidos_mes_anterior int not null default 0 check (pedidos_mes_anterior >= 0),
  ordem                int not null default 0,
  ativo                boolean not null default true,   -- false = some do cardápio sem apagar
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now()
);
create index if not exists itens_est on public.itens (estabelecimento_id, ordem);

-- Clientes finais (quem lê o cardápio) que criam conta para guardar favoritos.
create table if not exists public.clientes (
  id        uuid primary key references auth.users (id) on delete cascade,
  nome      text not null,
  telefone  text not null unique,
  criado_em timestamptz not null default now()
);

-- Curtidas. "visitante" é um código anônimo do aparelho; com conta, vira "c:<id do cliente>".
create table if not exists public.curtidas (
  item_id            uuid not null references public.itens (id) on delete cascade,
  estabelecimento_id uuid not null references public.estabelecimentos (id) on delete cascade,
  visitante          text not null,
  cliente_id         uuid references public.clientes (id) on delete set null,
  criado_em          timestamptz not null default now(),
  primary key (item_id, visitante)
);
create index if not exists curtidas_est on public.curtidas (estabelecimento_id);
create index if not exists curtidas_cliente on public.curtidas (cliente_id);

-- Tudo o que acontece no cardápio, para os números do painel.
create table if not exists public.eventos (
  id                 bigint generated always as identity primary key,
  estabelecimento_id uuid not null references public.estabelecimentos (id) on delete cascade,
  item_id            uuid references public.itens (id) on delete cascade,
  tipo               text not null check (tipo in ('abriu', 'viu', 'curtiu', 'descurtiu', 'compartilhou', 'detalhes')),
  visitante          text,
  criado_em          timestamptz not null default now()
);
create index if not exists eventos_est_data on public.eventos (estabelecimento_id, criado_em);


-- ---------------------------------------------------------------------
-- 2. Funções de apoio
-- ---------------------------------------------------------------------

-- A pessoa logada é dona deste estabelecimento (ou admin)?
create or replace function public.eh_dono(p_est uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select auth.uid() is not null and (
    exists (select 1 from estabelecimentos where id = p_est and dono_id = auth.uid())
    or exists (select 1 from admins where user_id = auth.uid())
  );
$$;

-- Mesma coisa a partir do texto da pasta no Storage (a pasta é o id do estabelecimento).
create or replace function public.eh_dono_pasta(p_pasta text)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
begin
  return public.eh_dono(p_pasta::uuid);
exception when invalid_text_representation then
  return false;
end;
$$;

-- Atualiza "atualizado_em" sozinho.
create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists estabelecimentos_atualizado on public.estabelecimentos;
create trigger estabelecimentos_atualizado before update on public.estabelecimentos
  for each row execute function public.tocar_atualizado_em();

drop trigger if exists itens_atualizado on public.itens;
create trigger itens_atualizado before update on public.itens
  for each row execute function public.tocar_atualizado_em();

-- Quem cria estabelecimento vira o dono (não dá para criar em nome de outra pessoa).
create or replace function public.definir_dono()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from admins where user_id = auth.uid()) then
    new.dono_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists estabelecimentos_dono on public.estabelecimentos;
create trigger estabelecimentos_dono before insert on public.estabelecimentos
  for each row execute function public.definir_dono();

-- Ao criar conta de cliente final (feita pelo cardápio), cria o registro em "clientes".
create or replace function public.criar_cliente()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data ->> 'tipo' = 'cliente' then
    insert into public.clientes (id, nome, telefone)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''), coalesce(new.raw_user_meta_data ->> 'telefone', ''))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists auth_criar_cliente on auth.users;
create trigger auth_criar_cliente after insert on auth.users
  for each row execute function public.criar_cliente();


-- ---------------------------------------------------------------------
-- 3. Segurança (RLS): quem pode ler e alterar o quê
-- ---------------------------------------------------------------------

alter table public.admins           enable row level security;
alter table public.estabelecimentos enable row level security;
alter table public.categorias       enable row level security;
alter table public.itens            enable row level security;
alter table public.clientes         enable row level security;
alter table public.curtidas         enable row level security;
alter table public.eventos          enable row level security;

-- estabelecimentos: todo mundo vê os ativos; o dono vê e edita o dele.
drop policy if exists est_ler on public.estabelecimentos;
create policy est_ler on public.estabelecimentos for select
  using (ativo or public.eh_dono(id));
drop policy if exists est_criar on public.estabelecimentos;
create policy est_criar on public.estabelecimentos for insert to authenticated
  with check (true);  -- o gatilho definir_dono coloca a pessoa logada como dona
drop policy if exists est_editar on public.estabelecimentos;
create policy est_editar on public.estabelecimentos for update to authenticated
  using (public.eh_dono(id)) with check (public.eh_dono(id));
drop policy if exists est_apagar on public.estabelecimentos;
create policy est_apagar on public.estabelecimentos for delete to authenticated
  using (public.eh_dono(id));

-- categorias e itens: leitura pública (só do que está ativo); escrita só do dono.
drop policy if exists cat_ler on public.categorias;
create policy cat_ler on public.categorias for select
  using (public.eh_dono(estabelecimento_id) or exists (select 1 from public.estabelecimentos e where e.id = estabelecimento_id and e.ativo));
drop policy if exists cat_escrever on public.categorias;
create policy cat_escrever on public.categorias for all to authenticated
  using (public.eh_dono(estabelecimento_id)) with check (public.eh_dono(estabelecimento_id));

drop policy if exists itens_ler on public.itens;
create policy itens_ler on public.itens for select
  using (public.eh_dono(estabelecimento_id) or (ativo and exists (select 1 from public.estabelecimentos e where e.id = estabelecimento_id and e.ativo)));
drop policy if exists itens_escrever on public.itens;
create policy itens_escrever on public.itens for all to authenticated
  using (public.eh_dono(estabelecimento_id)) with check (public.eh_dono(estabelecimento_id));

-- clientes: cada um vê e edita só o próprio cadastro.
drop policy if exists clientes_proprio on public.clientes;
create policy clientes_proprio on public.clientes for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- admins, curtidas e eventos: sem acesso direto. Tudo passa pelas funções abaixo.


-- ---------------------------------------------------------------------
-- 4. Funções chamadas pelo site
-- ---------------------------------------------------------------------

-- Cardápio completo de um estabelecimento (uma chamada só, para carregar rápido).
create or replace function public.cardapio_publico(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', e.id, 'slug', e.slug, 'nome', e.nome, 'nicho', e.nicho, 'cidade', e.cidade,
    'endereco', e.endereco, 'horario', e.horario, 'instagram', e.instagram, 'whatsapp', e.whatsapp,
    'branding', e.branding, 'logo_url', e.logo_url,
    'categorias', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'emoji', c.emoji) order by c.ordem, c.nome)
      from categorias c where c.estabelecimento_id = e.id
    ), '[]'::jsonb),
    'itens', coalesce((
      select jsonb_agg(to_jsonb(i) - 'estabelecimento_id' - 'criado_em' - 'atualizado_em'
               || jsonb_build_object(
                    'curtidas', (select count(*) from curtidas k where k.item_id = i.id),
                    'vistos_30d', (select count(*) from eventos v where v.item_id = i.id and v.tipo = 'viu' and v.criado_em > now() - interval '30 days')
                  )
               order by i.ordem, i.nome)
      from itens i where i.estabelecimento_id = e.id and i.ativo
    ), '[]'::jsonb)
  )
  from estabelecimentos e
  where e.slug = p_slug and e.ativo;
$$;

-- O link está livre? (usado no cadastro)
create or replace function public.slug_disponivel(p_slug text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     and length(p_slug) between 3 and 60
     and p_slug not in ('painel', 'cadastro', 'entrar', 'admin', 'favoritos', 'api', 'demo')
     and not exists (select 1 from estabelecimentos where slug = p_slug);
$$;

-- Curtir / descurtir. Devolve o total de curtidas do item.
create or replace function public.curtir(p_item uuid, p_visitante text, p_curtir boolean)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_est     uuid;
  v_total   int;
  v_mudou   int;
  v_vis     text := p_visitante;
begin
  if auth.uid() is not null and exists (select 1 from clientes where id = auth.uid()) then
    v_vis := 'c:' || auth.uid();
  end if;
  if v_vis is null or length(v_vis) not between 8 and 80 then
    raise exception 'visitante inválido';
  end if;

  select estabelecimento_id into v_est from itens where id = p_item and ativo;
  if v_est is null then
    raise exception 'item não encontrado';
  end if;

  if p_curtir then
    insert into curtidas (item_id, estabelecimento_id, visitante, cliente_id)
    values (p_item, v_est, v_vis, (select id from clientes where id = auth.uid()))
    on conflict (item_id, visitante) do nothing;
  else
    delete from curtidas where item_id = p_item and visitante in (v_vis, p_visitante);
  end if;
  get diagnostics v_mudou = row_count;

  -- só conta no painel quando a curtida realmente mudou (curtir duas vezes não soma)
  if v_mudou > 0 then
    insert into eventos (estabelecimento_id, item_id, tipo, visitante)
    values (v_est, p_item, case when p_curtir then 'curtiu' else 'descurtiu' end, v_vis);
  end if;

  select count(*) into v_total from curtidas where item_id = p_item;
  return v_total;
end;
$$;

-- Itens curtidos por este aparelho ou por esta conta, num estabelecimento.
create or replace function public.meus_favoritos(p_est uuid, p_visitante text)
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select distinct item_id from curtidas
  where estabelecimento_id = p_est
    and (visitante = p_visitante or (auth.uid() is not null and cliente_id = auth.uid()));
$$;

-- Depois do login/cadastro do cliente: as curtidas feitas no aparelho passam para a conta.
create or replace function public.vincular_curtidas(p_visitante text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_vis text;
begin
  if auth.uid() is null or not exists (select 1 from clientes where id = auth.uid()) then
    return;
  end if;
  v_vis := 'c:' || auth.uid();
  -- remove repetidas (mesmo item curtido no aparelho e na conta)
  delete from curtidas a using curtidas b
   where a.visitante = p_visitante and b.visitante = v_vis and a.item_id = b.item_id;
  update curtidas set visitante = v_vis, cliente_id = auth.uid() where visitante = p_visitante;
end;
$$;

-- Registra o que aconteceu no cardápio (aberturas, vídeos vistos, compartilhamentos...).
-- O site manda em lotes, no máximo 50 por vez.
create or replace function public.registrar_eventos(p_est uuid, p_visitante text, p_eventos jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  ev     jsonb;
  v_item uuid;
  v_n    int := 0;
begin
  if not exists (select 1 from estabelecimentos where id = p_est and ativo) then
    return;
  end if;
  if p_visitante is null or length(p_visitante) not between 8 and 80 then
    return;
  end if;
  for ev in select * from jsonb_array_elements(coalesce(p_eventos, '[]'::jsonb)) loop
    v_n := v_n + 1;
    exit when v_n > 50;
    continue when coalesce(ev ->> 'tipo', '') not in ('abriu', 'viu', 'compartilhou', 'detalhes');
    v_item := null;
    if ev ? 'item' then
      begin
        select id into v_item from itens where id = (ev ->> 'item')::uuid and estabelecimento_id = p_est;
      exception when invalid_text_representation then
        v_item := null;
      end;
      continue when v_item is null;
    end if;
    insert into eventos (estabelecimento_id, item_id, tipo, visitante)
    values (p_est, v_item, ev ->> 'tipo', p_visitante);
  end loop;
end;
$$;

-- Números do painel. Só o dono (ou admin) consegue ver.
create or replace function public.resumo_painel(p_est uuid, p_dias int default 30)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_ini  timestamptz := now() - make_interval(days => p_dias);
  v_ant  timestamptz := now() - make_interval(days => p_dias * 2);
  v_res  jsonb;
begin
  if not public.eh_dono(p_est) then
    raise exception 'sem permissão';
  end if;

  with ev as (
    select * from eventos where estabelecimento_id = p_est and criado_em > v_ant
  ),
  totais as (
    select
      count(distinct visitante) filter (where tipo = 'abriu' and criado_em > v_ini)  as pessoas,
      count(*) filter (where tipo = 'viu' and criado_em > v_ini)                     as visualizacoes,
      count(*) filter (where tipo = 'curtiu' and criado_em > v_ini)                  as curtidas,
      count(*) filter (where tipo = 'compartilhou' and criado_em > v_ini)            as compartilhamentos,
      count(*) filter (where tipo = 'detalhes' and criado_em > v_ini)                as detalhes,
      count(distinct visitante) filter (where tipo = 'abriu' and criado_em <= v_ini) as pessoas_ant,
      count(*) filter (where tipo = 'viu' and criado_em <= v_ini)                    as visualizacoes_ant,
      count(*) filter (where tipo = 'curtiu' and criado_em <= v_ini)                 as curtidas_ant,
      count(*) filter (where tipo = 'compartilhou' and criado_em <= v_ini)           as compartilhamentos_ant
    from ev
  ),
  dias as (
    select d::date as dia from generate_series((now() at time zone 'America/Sao_Paulo')::date - (p_dias - 1),
                                               (now() at time zone 'America/Sao_Paulo')::date, interval '1 day') d
  ),
  por_dia as (
    select dias.dia,
           count(distinct ev.visitante) filter (where ev.tipo = 'abriu') as pessoas,
           count(*) filter (where ev.tipo = 'viu')                        as visualizacoes
    from dias
    left join ev on (ev.criado_em at time zone 'America/Sao_Paulo')::date = dias.dia
    group by dias.dia
  ),
  por_hora as (
    select extract(hour from criado_em at time zone 'America/Sao_Paulo')::int as hora, count(distinct visitante) as pessoas
    from ev where tipo = 'abriu' and criado_em > v_ini
    group by 1
  ),
  por_item as (
    select i.id, i.nome,
           count(*) filter (where ev.tipo = 'viu')          as visualizacoes,
           count(*) filter (where ev.tipo = 'detalhes')     as detalhes,
           count(*) filter (where ev.tipo = 'compartilhou') as compartilhamentos,
           (select count(*) from curtidas k where k.item_id = i.id) as curtidas
    from itens i
    left join ev on ev.item_id = i.id and ev.criado_em > v_ini
    where i.estabelecimento_id = p_est
    group by i.id, i.nome
  )
  select jsonb_build_object(
    'dias', p_dias,
    'totais', (select to_jsonb(totais) from totais),
    'por_dia', coalesce((select jsonb_agg(jsonb_build_object('dia', dia, 'pessoas', pessoas, 'visualizacoes', visualizacoes) order by dia) from por_dia), '[]'::jsonb),
    'por_hora', coalesce((select jsonb_agg(jsonb_build_object('hora', hora, 'pessoas', pessoas) order by hora) from por_hora), '[]'::jsonb),
    'por_item', coalesce((select jsonb_agg(to_jsonb(por_item) order by visualizacoes desc, curtidas desc) from por_item), '[]'::jsonb),
    'clientes_com_conta', (select count(distinct cliente_id) from curtidas where estabelecimento_id = p_est and cliente_id is not null)
  ) into v_res;

  return v_res;
end;
$$;

-- Permissões das funções: o site (anon) pode chamar as públicas; as internas, não.
-- eh_dono precisa ficar liberada: as regras de leitura usam ela até para visitantes (devolve "não").
grant execute on function public.eh_dono(uuid), public.eh_dono_pasta(text) to anon, authenticated;
grant execute on function public.cardapio_publico(text), public.slug_disponivel(text),
  public.curtir(uuid, text, boolean), public.meus_favoritos(uuid, text),
  public.registrar_eventos(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.vincular_curtidas(text), public.resumo_painel(uuid, int) to authenticated;
revoke execute on function public.vincular_curtidas(text), public.resumo_painel(uuid, int) from public, anon;


-- ---------------------------------------------------------------------
-- 5. Arquivos (Storage): logos, fotos e vídeos
--    Pasta de cada estabelecimento: midia/<id do estabelecimento>/...
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midia', 'midia', true, 52428800,  -- 50 MB por arquivo (limite do plano grátis)
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists midia_dono_ler on storage.objects;
create policy midia_dono_ler on storage.objects for select to authenticated
  using (bucket_id = 'midia' and public.eh_dono_pasta((storage.foldername(name))[1]));
drop policy if exists midia_dono_enviar on storage.objects;
create policy midia_dono_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'midia' and public.eh_dono_pasta((storage.foldername(name))[1]));
drop policy if exists midia_dono_trocar on storage.objects;
create policy midia_dono_trocar on storage.objects for update to authenticated
  using (bucket_id = 'midia' and public.eh_dono_pasta((storage.foldername(name))[1]));
drop policy if exists midia_dono_apagar on storage.objects;
create policy midia_dono_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'midia' and public.eh_dono_pasta((storage.foldername(name))[1]));
