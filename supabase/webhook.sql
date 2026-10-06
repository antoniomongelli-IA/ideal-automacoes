-- =====================================================================
--  Avisos para o webhook (n8n) quando alguém se cadastra
--
--  Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
--  Pode rodar de novo sem problema. Para trocar o endereço, mude a URL
--  na função webhook_url() e rode de novo.
--
--  Eventos enviados (campo "evento"):
--    novo_estabelecimento → um dono terminou o cadastro do cardápio
--    novo_cliente         → um cliente final criou conta para salvar favoritos
--                           (com o item que curtiu/compartilhou, os links prontos e
--                            "aceita_mensagens": só mande a boas-vindas se for true)
--    recuperar_senha      → pediram "esqueci minha senha": mande o código pelo WhatsApp
--                           (enviado pela função pedir_codigo_senha do schema.sql)
--    erro_cardapio        → o site deu erro no celular de alguém (1 aviso por erro igual a cada hora)
--
--  Se o webhook estiver fora do ar, o cadastro NÃO é afetado: o aviso é perdido.
-- =====================================================================

-- pg_net: extensão do Supabase que faz chamadas HTTP de dentro do banco
create extension if not exists pg_net with schema extensions;

-- Endereço do webhook (o espaço e o "á" vão codificados, como exige uma URL)
create or replace function public.webhook_url()
returns text language sql immutable as $$
  select 'https://webhook.idealautomacoes.tech/webhook/Card%C3%A1pio%20Digital%20-%20Antonio'::text
$$;

-- Envia um JSON para o webhook sem nunca derrubar o cadastro
create or replace function public.avisar_webhook(p_corpo jsonb)
returns void
language plpgsql security definer set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := public.webhook_url(),
    body := p_corpo,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
exception when others then
  raise warning 'webhook não enviado: %', sqlerrm;
end;
$$;

-- 1) Novo estabelecimento (dono)
create or replace function public.webhook_novo_estabelecimento()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform public.avisar_webhook(jsonb_build_object(
    'evento', 'novo_estabelecimento',
    'id', new.id,
    'nome', new.nome,
    'slug', new.slug,
    'link', '/cardapio/' || new.slug,
    'nicho', new.nicho,
    'cidade', new.cidade,
    'whatsapp', new.whatsapp,
    'instagram', new.instagram,
    'email_dono', (select email from auth.users where id = new.dono_id),
    'criado_em', new.criado_em
  ));
  return new;
end;
$$;

drop trigger if exists webhook_estabelecimento on public.estabelecimentos;
create trigger webhook_estabelecimento after insert on public.estabelecimentos
  for each row execute function public.webhook_novo_estabelecimento();

-- 2) Novo cliente final (conta para favoritos)
create or replace function public.webhook_novo_cliente()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_meta   jsonb := (select raw_user_meta_data from auth.users where id = new.id);
  v_origem text := v_meta ->> 'origem';
begin
  perform public.avisar_webhook(jsonb_build_object(
    'evento', 'novo_cliente',
    'id', new.id,
    'nome', new.nome,
    'primeiro_nome', split_part(new.nome, ' ', 1),
    'telefone', new.telefone,
    'aceita_mensagens', new.aceita_whatsapp,
    'estabelecimento_slug', v_origem,
    'estabelecimento_nome', (select nome from estabelecimentos where slug = v_origem),
    -- o que a pessoa fez antes de criar a conta: "curtiu" ou "compartilhou" (vazio se criou pelo menu)
    'acao', v_meta ->> 'acao',
    'item_id', v_meta ->> 'item_id',
    'item_nome', v_meta ->> 'item_nome',
    -- links completos para a mensagem de boas-vindas
    'link_cardapio', v_meta ->> 'link_cardapio',
    'link_item', v_meta ->> 'link_item',
    'criado_em', new.criado_em
  ));
  return new;
end;
$$;

drop trigger if exists webhook_cliente on public.clientes;
create trigger webhook_cliente after insert on public.clientes
  for each row execute function public.webhook_novo_cliente();

-- 3) Erro no site (cardápio ou painel)
create or replace function public.webhook_erro()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- o mesmo erro só avisa uma vez por hora
  if exists (
    select 1 from erros
     where mensagem = new.mensagem and id <> new.id and criado_em > now() - interval '1 hour'
  ) then
    return new;
  end if;
  perform public.avisar_webhook(jsonb_build_object(
    'evento', 'erro_cardapio',
    'mensagem', new.mensagem,
    'pagina', new.pagina,
    'estabelecimento_nome', (select nome from estabelecimentos where id = new.estabelecimento_id),
    'navegador', new.navegador,
    'versao', new.versao,
    'detalhe', left(new.detalhe, 800),
    'criado_em', new.criado_em
  ));
  return new;
end;
$$;

drop trigger if exists webhook_erro on public.erros;
create trigger webhook_erro after insert on public.erros
  for each row execute function public.webhook_erro();

-- Ninguém de fora chama essas funções diretamente
revoke execute on function public.avisar_webhook(jsonb), public.webhook_url() from public, anon, authenticated;
