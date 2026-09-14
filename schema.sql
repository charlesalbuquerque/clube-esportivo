-- ============================================================
-- Sistema Web para Gestão de Clubes Esportivos
-- Schema inicial (MVP) — Supabase / Postgres
-- Rode este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1) PROFILES
-- Unifica dados de admin e associado. O id é o mesmo do auth.users
-- (criado automaticamente quando alguém se cadastra via Supabase Auth).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'associado' check (role in ('admin', 'associado')),
  phone text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- 2) MENSALIDADES
create table mensalidades (
  id bigint generated always as identity primary key,
  associado_id uuid not null references profiles (id) on delete cascade,
  referencia_mes date not null,          -- ex: 2026-09-01 representa setembro/2026
  valor numeric(10, 2) not null,
  status text not null default 'pendente' check (status in ('pago', 'pendente', 'atrasado')),
  data_pagamento date,
  created_at timestamptz not null default now(),
  unique (associado_id, referencia_mes)
);

-- 3) QUADRAS
create table quadras (
  id bigint generated always as identity primary key,
  nome text not null,
  tipo text not null,                    -- ex: 'tenis', 'futsal', 'volei'
  descricao text
);

-- 4) RESERVAS
create table reservas (
  id bigint generated always as identity primary key,
  quadra_id bigint not null references quadras (id) on delete cascade,
  associado_id uuid not null references profiles (id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  created_at timestamptz not null default now(),
  -- impede duas reservas confirmadas na mesma quadra/data/horário de início
  unique (quadra_id, data, hora_inicio)
);

-- 5) PARTIDAS
--
-- ATENÇÃO: este create table ficou desatualizado em relação ao banco real
-- (achado ao adaptar as telas do design_handoff/ em 2026-09-14). A coluna
-- `tipo` e a tabela `partida_participantes` abaixo já existem no Supabase
-- e são usadas por app/actions/partidas.ts (partida em equipe), mas nunca
-- foram adicionadas aqui. Deixando documentado — quem mexeu direto no SQL
-- Editor sem atualizar este arquivo, por favor mantenha os dois em sync
-- da próxima vez.
create table partidas (
  id bigint generated always as identity primary key,
  jogador1_id uuid not null references profiles (id) on delete cascade,
  jogador2_id uuid not null references profiles (id) on delete cascade,
  placar1 int not null default 0,
  placar2 int not null default 0,
  quadra_id bigint references quadras (id),
  data date not null default current_date,
  created_at timestamptz not null default now(),
  tipo text not null default 'individual' check (tipo in ('individual', 'equipe'))
);

-- Participantes extras de uma partida em equipe (lado_a / lado_b). Em
-- partidas individuais essa tabela não é usada — jogador1_id/jogador2_id
-- já bastam. Em partidas de equipe, jogador1_id/jogador2_id guardam só o
-- primeiro participante de cada lado (ver comentário em
-- app/actions/partidas.ts) e esta tabela guarda todos os demais.
create table if not exists partida_participantes (
  id bigint generated always as identity primary key,
  partida_id bigint not null references partidas (id) on delete cascade,
  associado_id uuid not null references profiles (id) on delete cascade,
  lado text not null check (lado in ('lado_a', 'lado_b')),
  unique (partida_id, associado_id)
);

-- 6) RANKING (view calculada — não é tabela, evita dado duplicado/desatualizado)
create view ranking as
with jogos as (
  select jogador1_id as jogador_id,
         case when placar1 > placar2 then 1 else 0 end as vitoria,
         case when placar1 < placar2 then 1 else 0 end as derrota
  from partidas
  union all
  select jogador2_id as jogador_id,
         case when placar2 > placar1 then 1 else 0 end as vitoria,
         case when placar2 < placar1 then 1 else 0 end as derrota
  from partidas
)
select
  p.id as associado_id,
  p.full_name,
  coalesce(sum(j.vitoria), 0) as vitorias,
  coalesce(sum(j.derrota), 0) as derrotas,
  coalesce(sum(j.vitoria), 0) * 3 as pontos   -- 3 pontos por vitória, ajustável
from profiles p
left join jogos j on j.jogador_id = p.id
where p.role = 'associado'
group by p.id, p.full_name
order by pontos desc;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Sem isso, qualquer pessoa com a chave anon lê/escreve tudo.
-- ============================================================

alter table profiles enable row level security;
alter table mensalidades enable row level security;
alter table quadras enable row level security;
alter table reservas enable row level security;
alter table partidas enable row level security;

-- Função auxiliar pra checar se o usuário logado é admin. Roda como
-- SECURITY DEFINER (contorna RLS na consulta interna) — necessário porque
-- uma policy de SELECT em profiles que consulta a própria profiles causa
-- "42P17 infinite recursion detected in policy" no Postgres.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: cada um vê/edita o próprio perfil; admin vê todos
create policy "usuario ve o proprio perfil"
  on profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "usuario edita o proprio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "admin edita qualquer perfil"
  on profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Sem restrição de coluna, a policy de self-update acima deixaria um
-- associado trocar o próprio role/status via API direta (não pela UI, mas
-- RLS não impede). Esse trigger reverte essas duas colunas se quem edita
-- não é admin.
create or replace function public.prevent_self_role_status_change()
returns trigger
language plpgsql
as $$
begin
  -- auth.uid() só existe numa requisição autenticada via Supabase Auth
  -- (app/PostgREST). Uma conexão direta (SQL Editor, service role,
  -- migração) não tem isso — é um contexto já confiável por definição,
  -- então não reforçamos a checagem nesse caso.
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger before_profiles_update
  before update on profiles
  for each row execute function public.prevent_self_role_status_change();

-- mensalidades: associado vê as próprias; admin vê e edita todas
create policy "associado ve suas mensalidades"
  on mensalidades for select
  using (associado_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "admin gerencia mensalidades"
  on mensalidades for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- quadras: todo mundo autenticado pode ver
create policy "todos veem quadras"
  on quadras for select
  using (auth.role() = 'authenticated');

-- reservas: associado vê/cria as próprias; admin vê todas
create policy "associado gerencia suas reservas"
  on reservas for all
  using (associado_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- partidas: todo mundo autenticado pode ver; só admin registra
create policy "todos veem partidas"
  on partidas for select
  using (auth.role() = 'authenticated');

create policy "admin registra partidas"
  on partidas for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- CRIAÇÃO AUTOMÁTICA DE PROFILE NO CADASTRO
-- Não existe policy de INSERT em profiles (por segurança: cliente não
-- deveria poder criar profiles arbitrariamente). Em vez disso, um trigger
-- com SECURITY DEFINER cria a linha assim que o usuário é criado em
-- auth.users — funciona mesmo se a confirmação de e-mail estiver ativada
-- (nesse caso o usuário ainda não tem sessão logo após o signUp).
-- O nome completo é lido de auth.users.raw_user_meta_data (passado via
-- options.data no supabase.auth.signUp() do app).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

  -- Horários disponíveis de cada quadra
create table if not exists quadra_horarios (
  id bigint generated always as identity primary key,
  quadra_id bigint not null references quadras(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),

  check (hora_inicio < hora_fim),

  unique (
    quadra_id,
    dia_semana,
    hora_inicio,
    hora_fim
  )
);
create or replace function public.prevent_reserva_overlap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if new.status = 'confirmada'
     and exists (
       select 1
       from public.reservas r
       where r.quadra_id = new.quadra_id
         and r.data = new.data
         and r.status = 'confirmada'
         and r.id <> coalesce(new.id, 0)
         and new.hora_inicio < r.hora_fim
         and new.hora_fim > r.hora_inicio
     )
  then
    raise exception 'HORARIO_INDISPONIVEL';
  end if;

  return new;

end;
$$;

drop trigger if exists before_reserva_overlap on reservas;


create trigger before_reserva_overlap

before insert or update on reservas

for each row

execute function public.prevent_reserva_overlap();
