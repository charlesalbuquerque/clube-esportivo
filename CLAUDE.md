@AGENTS.md
# Sistema Web para Gestão de Clubes Esportivos

Projeto de extensão universitária (UNIVAP) — MVP com entrega em 19/09/2026.

## Stack

- **Frontend + Backend:** Next.js (App Router, TypeScript)
- **Estilização:** Tailwind CSS
- **Banco de dados + Autenticação:** Supabase (Postgres + Supabase Auth)
- **Deploy:** Vercel

## Banco de dados

Schema já criado no Supabase (ver `schema.sql` na raiz do projeto). Tabelas:

- `profiles` — unifica admin e associado (id = mesmo id do Supabase Auth)
- `mensalidades` — vinculada a `profiles.id`, status: pago/pendente/atrasado
- `quadras` — cadastro de quadras
- `reservas` — vinculada a `quadras` e `profiles`, com unique(quadra_id, data, hora_inicio) pra impedir conflito de horário
- `partidas` — jogador1, jogador2, placar, tipo (individual/equipe); `partida_participantes` guarda os demais jogadores das partidas em equipe
- `get_ranking()` — **function** (não tabela/view) que agrega `partidas` + `partida_participantes` em pontos corridos (vitória=3, empate=1, derrota=0)

Row Level Security habilitado em todas as tabelas: associado só vê/edita os próprios dados; admin vê e gerencia tudo (checagem pelo campo `role` em `profiles`).

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
