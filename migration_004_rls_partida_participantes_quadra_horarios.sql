-- ============================================================
-- Migração 004 — RLS em partida_participantes e quadra_horarios
-- Rode no SQL Editor do Supabase.
--
-- URGENTE: essas duas tabelas foram criadas sem RLS habilitado e sem
-- nenhuma policy — diferente de profiles/mensalidades/quadras/reservas/
-- partidas, que já têm RLS desde o schema.sql original. Sem isso,
-- qualquer pessoa com a chave anon lê/escreve essas duas tabelas
-- livremente, inclusive dados de outros associados.
--
-- Mesmo padrão já usado no resto do schema:
--   - partida_participantes segue "partidas" (todo autenticado vê;
--     só admin escreve)
--   - quadra_horarios segue "quadras" (todo autenticado vê; só admin
--     escreve)
-- O policy "admin gerencia X" usa `for all`, igual ao padrão já
-- existente em "admin gerencia mensalidades" — cobre insert/update/
-- delete num só (delete não foi pedido explicitamente, mas manter o
-- mesmo padrão evita um admin travado sem poder corrigir um cadastro
-- errado nessas tabelas).
-- ============================================================

alter table partida_participantes enable row level security;
alter table quadra_horarios enable row level security;

create policy "todos veem participantes"
  on partida_participantes for select
  using (auth.role() = 'authenticated');

create policy "admin gerencia participantes"
  on partida_participantes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "todos veem horarios"
  on quadra_horarios for select
  using (auth.role() = 'authenticated');

create policy "admin gerencia horarios"
  on quadra_horarios for all
  using (public.is_admin())
  with check (public.is_admin());
