-- ============================================================
-- Migração 002 — campos exigidos pelo novo protótipo (design_handoff/)
-- Rode no SQL Editor do Supabase (mesmo processo do schema.sql original).
-- Só ADICIONA colunas/constraints — não apaga nem renomeia nada existente.
-- ============================================================

-- 1) PROFILES ---------------------------------------------------

-- Matrícula: número de associado, gerado automaticamente (4 dígitos,
-- zero-padded) via sequence. Backfill pras linhas existentes na ordem
-- de cadastro (created_at), e trigger pra novas linhas.
create sequence if not exists profiles_matricula_seq;

alter table profiles add column if not exists matricula text unique;

with numeradas as (
  select id, lpad(nextval('profiles_matricula_seq')::text, 4, '0') as num
  from profiles
  where matricula is null
  order by created_at
)
update profiles p
set matricula = n.num
from numeradas n
where p.id = n.id;

create or replace function public.set_matricula()
returns trigger
language plpgsql
as $$
begin
  if new.matricula is null then
    new.matricula := lpad(nextval('profiles_matricula_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists before_profiles_insert_matricula on profiles;
create trigger before_profiles_insert_matricula
  before insert on profiles
  for each row execute function public.set_matricula();

-- Categoria (titular/dependente) + vínculo com o titular da família.
alter table profiles add column if not exists categoria text
  not null default 'titular' check (categoria in ('titular', 'dependente'));

alter table profiles add column if not exists titular_id uuid
  references profiles (id) on delete set null;

-- Plano e modalidades praticadas (exibição — não é a fonte de verdade do
-- valor cobrado, isso continua em mensalidades.valor).
alter table profiles add column if not exists plano text not null default 'Individual';

alter table profiles add column if not exists modalidades text[] not null default '{}';

-- 2) MENSALIDADES ------------------------------------------------

alter table mensalidades add column if not exists forma_pagamento text
  check (forma_pagamento in ('pix', 'boleto', 'cartao', 'isento'));

-- 3) RESERVAS ------------------------------------------------------

-- Tipo do bloco na grade: reserva normal, aula ou manutenção (bloqueio).
alter table reservas add column if not exists tipo text
  not null default 'reserva' check (tipo in ('reserva', 'aula', 'manutencao'));

-- Aula/manutenção podem não ter um associado específico.
alter table reservas alter column associado_id drop not null;

-- RLS de reservas: a policy "for all" original restringia o SELECT ao
-- próprio associado, então um associado via slots de OUTRAS pessoas como
-- "livres" na grade (só descobria o conflito ao tentar reservar — a
-- trigger before_reserva_overlap barrava a escrita, mas a experiência era
-- enganosa). A grade nova precisa que todo autenticado veja as reservas
-- confirmadas de todo mundo pra saber o que está ocupado.
drop policy if exists "associado gerencia suas reservas" on reservas;

create policy "autenticados veem reservas confirmadas"
  on reservas for select
  using (auth.role() = 'authenticated');

create policy "associado cria suas proprias reservas"
  on reservas for insert
  with check (
    (tipo = 'reserva' and associado_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "dono ou admin atualiza reserva"
  on reservas for update
  using (
    associado_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "dono ou admin cancela reserva"
  on reservas for delete
  using (
    associado_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 4) PARTIDAS ------------------------------------------------------

alter table partidas add column if not exists modalidade text
  not null default 'tenis_simples'
  check (modalidade in ('tenis_simples', 'tenis_duplas', 'beach_tennis'));

-- Placar por set (opcional) — placar1/placar2 continuam sendo o
-- agregado (sets ganhos) usado pelo ranking, sem mudança de comportamento.
alter table partidas add column if not exists sets jsonb;

-- ============================================================
-- Deliberadamente FORA desta migração (avisar o time antes de fazer):
--   - Histórico de posição no ranking ("variação de posição" no design) —
--     exigiria um mecanismo de snapshot periódico, não só uma coluna.
--   - Fluxo de aprovação de cadastro ("pendências da secretaria" ·
--     cadastros aguardando aprovação) — hoje o trigger handle_new_user()
--     já cria o profile como ativo; um estado "pendente" é uma feature
--     de produto nova, não um campo isolado.
-- ============================================================
