-- ============================================================
-- Migração 003 — get_ranking() por modalidade
-- Rode no SQL Editor do Supabase (mesmo processo das migrações anteriores).
--
-- Troca get_ranking() (sem parâmetros) por get_ranking(p_modalidade),
-- pra alimentar as abas "Tênis · simples / duplas / Beach tennis" da
-- tela de partidas e ranking (admin/partidas/page.tsx). Chamar sem
-- argumento (ou com null) continua agregando todas as modalidades —
-- RankingCard.tsx (Top 3 do painel) não precisa mudar.
--
-- Precisa dropar antes de recriar porque muda a lista de parâmetros
-- (CREATE OR REPLACE FUNCTION não permite isso).
-- ============================================================

drop function if exists public.get_ranking();

create or replace function public.get_ranking(p_modalidade text default null)
returns table (
  associado_id uuid,
  nome text,
  partidas integer,
  vitorias integer,
  empates integer,
  derrotas integer,
  pontos integer
)
language sql
stable security definer
set search_path to 'public'
as $$
  with resultados as (

    -- PARTIDAS INDIVIDUAIS
    select
      p.jogador1_id as associado_id,
      case
        when p.placar1 > p.placar2 then 3
        when p.placar1 = p.placar2 then 1
        else 0
      end as pontos,
      case when p.placar1 > p.placar2 then 1 else 0 end as vitorias,
      case when p.placar1 = p.placar2 then 1 else 0 end as empates,
      case when p.placar1 < p.placar2 then 1 else 0 end as derrotas
    from partidas p
    where p.tipo = 'individual'
      and (p_modalidade is null or p.modalidade = p_modalidade)

    union all

    select
      p.jogador2_id as associado_id,
      case
        when p.placar2 > p.placar1 then 3
        when p.placar2 = p.placar1 then 1
        else 0
      end as pontos,
      case when p.placar2 > p.placar1 then 1 else 0 end as vitorias,
      case when p.placar2 = p.placar1 then 1 else 0 end as empates,
      case when p.placar2 < p.placar1 then 1 else 0 end as derrotas
    from partidas p
    where p.tipo = 'individual'
      and (p_modalidade is null or p.modalidade = p_modalidade)

    union all

    -- PARTIDAS EM EQUIPE
    select
      pp.associado_id,
      case
        when pp.lado = 'lado_a' and p.placar1 > p.placar2 then 3
        when pp.lado = 'lado_b' and p.placar2 > p.placar1 then 3
        when p.placar1 = p.placar2 then 1
        else 0
      end as pontos,
      case
        when pp.lado = 'lado_a' and p.placar1 > p.placar2 then 1
        when pp.lado = 'lado_b' and p.placar2 > p.placar1 then 1
        else 0
      end as vitorias,
      case
        when p.placar1 = p.placar2 then 1
        else 0
      end as empates,
      case
        when pp.lado = 'lado_a' and p.placar1 < p.placar2 then 1
        when pp.lado = 'lado_b' and p.placar2 < p.placar1 then 1
        else 0
      end as derrotas
    from partidas p
    join partida_participantes pp
      on pp.partida_id = p.id
    where p.tipo = 'equipe'
      and (p_modalidade is null or p.modalidade = p_modalidade)
  )

  select
    r.associado_id,
    pr.full_name as nome,
    count(*)::integer as partidas,
    sum(r.vitorias)::integer as vitorias,
    sum(r.empates)::integer as empates,
    sum(r.derrotas)::integer as derrotas,
    sum(r.pontos)::integer as pontos
  from resultados r
  join profiles pr
    on pr.id = r.associado_id
  group by r.associado_id, pr.full_name
  order by pontos desc, vitorias desc, nome asc;
$$;
