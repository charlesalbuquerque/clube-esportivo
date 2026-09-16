@AGENTS.md
# Sistema Web para Gestão de Clubes Esportivos

Projeto de extensão universitária (UNIVAP) — MVP com entrega em 19/09/2026.

## Stack

- **Frontend + Backend:** Next.js (App Router, TypeScript)
- **Estilização:** Tailwind CSS
- **Banco de dados + Autenticação:** Supabase (Postgres + Supabase Auth)
- **Deploy:** Vercel

## Banco de dados

Schema já criado no Supabase (ver `schema.sql` na raiz do projeto, mais as migrações numeradas `migration_00N_*.sql` que ainda não foram fundidas nele). Tabelas:

- `profiles` — unifica admin e associado (id = mesmo id do Supabase Auth); matrícula, categoria, plano e modalidades praticadas vêm da `migration_002`
- `mensalidades` — vinculada a `profiles.id`, status: pago/pendente/atrasado
- `quadras` — cadastro de quadras
- `quadra_horarios` — grade de horários disponíveis por quadra (dia da semana + hora_inicio/hora_fim)
- `reservas` — vinculada a `quadras` e `profiles`, com unique(quadra_id, data, hora_inicio) pra impedir conflito de horário
- `partidas` — jogador1, jogador2, placar, tipo (individual/equipe), modalidade (tenis_simples/tenis_duplas/beach_tennis, `migration_002`), placar por set opcional em `sets` (jsonb); `partida_participantes` guarda os demais jogadores das partidas em equipe (lado_a/lado_b)
- `get_ranking(p_modalidade)` — **function** (não tabela/view) que agrega `partidas` + `partida_participantes` em pontos corridos por modalidade (vitória=3, empate=1, derrota=0); chamada sem argumento agrega todas as modalidades

Row Level Security habilitado em todas as tabelas, incluindo `partida_participantes` e `quadra_horarios`: associado só vê/edita os próprios dados (ou só lê, conforme a tabela); admin vê e gerencia tudo (checagem pelo campo `role` em `profiles` via `is_admin()`).

## Módulos e responsáveis

| Módulo | Responsável |
|---|---|
| Autenticação e perfis (`profiles`) | Charles |
| Gerenciamento de Associados | Charles |
| Mensalidades | Charles |
| Quadras e Reservas | Erick |
| Partidas e Ranking | Erick |
| Infraestrutura (repo, deploy) | Erick |
| Painel Administrativo | Quem terminar primeiro (depende dos outros módulos) |

## Convenções de código

- Uma branch por funcionalidade: `feature/nome-do-modulo`
- `main` protegida — só recebe merge via Pull Request
- PRs pequenos e frequentes
- Cada pessoa mexe só nos arquivos/pastas do próprio módulo pra evitar conflito

## Gestão do projeto

Board no Trello: https://trello.com/b/Hb6yr7Ni/gest%C3%A3o-de-clube-esportivo
