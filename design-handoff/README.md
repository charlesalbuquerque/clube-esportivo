# Handoff: Sistema Web para Gestão de Clubes Esportivos

## Overview
Plataforma web que centraliza a administração de um clube esportivo, substituindo planilhas, papel e mensagens. Duas áreas de acesso — **administração** (secretaria/gestores) e **associado** (usuário final) — sobre a mesma base de dados.

Escopo desenhado: login, painel geral do clube, cadastro de associados, controle de mensalidades, reserva de quadras (grade quadra × horário), registro de partidas + ranking por pontos corridos, e área do associado.

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não** código de produção para copiar. A tarefa é **recriar essas telas no ambiente já existente do codebase** (React, Vue, Angular, Blade/Laravel, Django templates, etc.), usando seus padrões, componentes e bibliotecas. Se o projeto ainda não tem front-end definido, escolha o framework mais adequado e implemente as telas nele.

`Gestao Clube.dc.html` é um único arquivo com todas as telas e navegação por estado (`state.screen`, `state.role`). Em produção, isso deve virar rotas reais.

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, densidade de tabela e estados de hover estão definidos e devem ser reproduzidos fielmente com os componentes do codebase. Os dados exibidos são fictícios (associados, valores, placares) e devem vir da API.

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| green-700 | `#12572f` | cor primária: botões, chips "pago/ativo", barras, links |
| green-800 | `#0b3d20` | hover de botão primário |
| green-900 | `#0f3a21` | fundo da sidebar e do painel de login |
| green-850 | `#123f25` | cartões dentro da sidebar / hero |
| green-800b | `#1c5231` | item de nav ativo |
| green-border | `#245536` / `#2c603d` | bordas sobre fundo verde |
| green-text-dim | `#bfd3c3` / `#b6c9b9` | texto secundário sobre verde |
| green-text-faint | `#6f9179` / `#8fae95` | labels mono sobre verde |
| lime-accent | `#d8e84f` | acento único: logo, números do hero, marcador ativo |
| teal | `#235f74` | categoria "aula" na grade e chip "isento" |
| ink | `#14181a` | texto principal |
| ink-soft | `#3d443f` | texto de célula de tabela |
| muted | `#7c837e` | labels |
| muted-2 | `#5d645f` / `#6b7370` / `#8b918c` | escala de texto secundário |
| bg | `#f2f3f0` | fundo da aplicação |
| surface | `#ffffff` | cartões e tabelas |
| surface-alt | `#fbfbf9` | header e coluna de login |
| surface-head | `#f7f8f5` | cabeçalho de tabela / rodapés informativos |
| border | `#e2e5df` | borda de cartão |
| border-soft | `#eceee8` | divisória de linha de tabela |
| input-border | `#d9ddd6` | borda de campo |
| warn-fg / bg / bd | `#8a5a0b` / `#fdf5e6` / `#f0e3ca` | status pendente |
| danger-fg / bg / bd | `#9c2230` / `#fbeef0` / `#f0d4d8` | status atrasado/suspenso |
| ok-fg / bg / bd | `#12572f` / `#eef4ee` / `#cfe0d3` | status pago/ativo/confirmada |
| neutral-chip | `#6b7370` / `#f2f3f0` / `#e2e5df` | status inativo |
| gold | `#e7c88a` | fatia "em aberto" nas barras de receita |
| maintenance | `#e8e9e4` bg / `#d4d7d0` borda / `#6b7370` texto | célula em manutenção |
| info-panel | `#f4f7f2` bg / `#e0e6dd` borda / `#2c4a35` texto | caixa de regras |
| alert-panel | `#fdf8ee` bg / `#f0e3ca` borda / `#6b4d12` texto | aviso de vencimento |

### Tipografia
- **Spectral** (serif), weight 600 — títulos: h1 login 54px/1.04, título de página 24px, título de seção 16px, nome do associado 22px.
- **IBM Plex Sans** — texto de interface. Base 14px; tabela 13px; auxiliar 11–12px; labels de formulário 10–11px uppercase com `letter-spacing: 0.12em`.
- **IBM Plex Mono** — todos os números, matrículas, datas, horários, placares e labels de eixo. 10px (labels), 11–13px (células), 22–26px (KPIs e números do hero).
- Botões: 11–12px, weight 600, uppercase, `letter-spacing: 0.10–0.14em`.
- Google Fonts: `Spectral:500,600,700`, `IBM Plex Sans:400,500,600`, `IBM Plex Mono:400,500`.

### Espaçamento / forma
- Escala usada: 2, 3, 6, 8, 10, 12, 14, 16, 18, 22, 24, 40, 44, 48px.
- **Border radius: 0 em tudo.** Nenhum canto arredondado, nenhuma sombra. A hierarquia vem de bordas de 1px e fundos.
- Cartões: `background #fff; border: 1px solid #e2e5df`. Header do cartão: `padding: 13px 16px; border-bottom: 1px solid #e2e5df`.
- Faixas de KPI usam a técnica de "grid com gap 1px e fundo `#e2e5df`" — as divisórias são o próprio fundo do container.
- Densidade da tabela: padding vertical **9px** (compacta, padrão) ou **13px** (confortável).
- Células numéricas: `white-space: nowrap` obrigatório (senão placares como "24–6" quebram no hífen).
- Grids com `<input>`/`<select>`: labels precisam de `min-width: 0` e campos de `width: 100%`, senão o tamanho intrínseco do input estoura o container.

## Screens / Views

### 1. Login
**Objetivo:** autenticar e direcionar para a área correta.
**Layout:** grid de 2 colunas — `minmax(0,1fr)` (hero) e `minmax(360px,460px)` (formulário), altura mínima 100vh.

- **Hero (esquerda):** fundo `#0f3a21`, padding 44/48. Topo: quadrado 34px `#d8e84f` com iniciais do clube em Spectral 700 + nome do clube 12px uppercase `letter-spacing: 0.16em`. Meio: h1 Spectral 600 54px branco (máx. 20ch), parágrafo 15px/1.65 `#b6c9b9` (máx. 46ch) e uma faixa de 3 estatísticas (grid 1px gap sobre `#245536`, números mono 26px `#d8e84f`, labels 11px uppercase `#8fae95`). Base: linha mono 11px com versão, ramal de suporte e data dos dados.
- **Formulário (direita):** fundo `#fbfbf9`, `border-left: 1px solid #e2e5df`, coluna centralizada verticalmente, gap 20px.
  - Eyebrow 11px uppercase + h2 Spectral 30px "Identifique-se".
  - **Seletor de perfil:** grid 2 colunas dentro de `border: 1px solid #d9ddd6`; a aba ativa fica `background: #12572f; color: #fff; weight 600`, a inativa `background: #fff; color: #5d645f`; a segunda aba tem `border-left: 1px solid #d9ddd6`. **O estado ativo deve derivar do perfil selecionado.**
  - Campos e-mail e senha: label mono uppercase 10px + input `padding: 12px 13px; border: 1px solid #d9ddd6`; foco `border-color #12572f; outline: 2px solid #dfe9db`.
  - Linha 13px: checkbox "Manter conectado" (`accent-color: #12572f`) + link "Esqueci a senha".
  - Botão primário full-width: `padding: 13px; background: #12572f; color: #fff`, texto 12px uppercase; hover `#0b3d20`.
  - Rodapé com `border-top: 1px solid #e6e8e2`: link "Solicitar cadastro" + nota de que a liberação é feita pela secretaria.

### 2. Shell da aplicação (todas as telas internas)
**Layout:** grid `226px | minmax(0,1fr)`, mínimo 100vh.

- **Sidebar** (`#0f3a21`, padding 18/12, `border-right: 1px solid #0b2e19`):
  - Marca: quadrado 28px `#d8e84f` + nome 11px uppercase.
  - Grupo de nav com label mono 10px uppercase `#6f9179` ("administração" / "meu clube").
  - Itens: botão full-width `padding: 9px 8px`, flex com gap 9px, fonte 13px. Marcador quadrado 5px — `#d8e84f` quando ativo, `#4a7a5a` quando não. Ativo: `background: #1c5231; color: #fff; weight 600`. Inativo: transparente, `#bfd3c3`. Contador opcional à direita em mono 10px.
  - Nav admin: Painel geral · Associados (412) · Mensalidades (26) · Quadras (7) · Partidas e ranking · Ver como associado.
  - Nav associado: Minha área · Reservar quadra · Ranking · Painel do clube.
  - Rodapé (`margin-top: auto`): cartão de sessão (`#123f25`, borda `#245536`) com nome e papel; botão de alternar perfil (borda `#2c603d`, hover borda+texto `#d8e84f`); botão "Sair" em texto `#7f9d86`.
- **Header** (`#fbfbf9`, `padding: 14px 24px`, `border-bottom: 1px solid #e2e5df`, `flex-wrap: wrap`, gap 14/18):
  - Bloco de título `flex: 1 1 210px`: breadcrumb mono 10px uppercase + h1 Spectral 24px.
  - À direita (`margin-left: auto`, wrap): busca (`flex: 1 1 170px; max-width: 268px`), indicador de competência (borda 1px, quadrado 6px `#12572f`, "SET/2026") e botão primário contextual.
- **Conteúdo:** `padding: 20px 24px 40px`, coluna com gap 18px.

### 3. Painel geral (admin) — lidera por ocupação
1. **Faixa de 6 KPIs** — grid `repeat(auto-fit, minmax(170px,1fr))`, gap 1px sobre `#e2e5df`. Cada um: label mono 10px uppercase, valor mono 25px, delta mono 11px (verde se positivo, `#9c2230` se negativo, `#8b918c` se neutro), nota 11px. Ordem: ocupação média 74% · ocupação no pico 96% · reservas hoje 38 · horas ociosas 22h · associados ativos 412 · em aberto R$ 7,9k.
2. **Linha principal** — grid `minmax(0,1.4fr) | minmax(0,1fr)`, gap 18px.
   - **Ocupação das quadras** (ocupa a coluna larga, via `order: -1`): header com título, nota "média dos últimos 7 dias" e link "grade completa". Corpo em 2 subcolunas (gap 1px sobre `#eceee8`): "por faixa de horário" (07–09 42%, 09–11 58%, 13–15 36%, 15–17 51%, 17–19 82%, 19–21 96%) e "por quadra" (Q1 92%, Q2 61%, Q3 78%, Q4 70%, Areia 1 88%, Society 55%). Barras: trilho `#eceee8` altura 10–12px, preenchimento `#12572f` acima de 80% e `#5c8c6c` abaixo; valor mono 11px alinhado à direita. Rodapé informativo em `#f7f8f5`.
   - **Receita e inadimplência:** 6 barras empilhadas (recebido `#12572f` + em aberto `#e7c88a`) em área de 168px, total mono acima, mês mono abaixo, legenda com taxa de inadimplência.
3. **Segunda linha** — 2 colunas iguais:
   - **Pendências da secretaria:** lista com quadrado 8px colorido por natureza (`#8a5a0b` aprovação, `#9c2230` inadimplência, `#235f74` operacional, `#8b918c` administrativo), título 13px, meta 11px e botão de ação 11px uppercase.
   - **Líderes do ranking:** top 5 — posição mono, nome 13px weight 500, categoria 12px, pontos mono 13px com sufixo "pts" 10px, variação de posição.

### 4. Associados
Cartão único. Barra de filtros: chips `padding: 6px 11px`, 11px uppercase — ativo `#12572f` com texto branco, inativo borda `#d9ddd6` sobre branco. Filtros: Todos / Ativos / Inadimplentes / Dependentes. À direita: contador mono ("10 de 412 exibidos") e botão "Exportar CSV".

Tabela — cabeçalho `background: #f7f8f5`, th mono 10px uppercase `#7c837e`. Colunas: Matrícula (mono) · Associado (nome weight 600 + e-mail 11px `#8b918c`) · Categoria · Modalidades · Desde (mono) · Plano (mono, direita) · Situação (chip) · Ações (link "abrir" → perfil). Linhas com `border-bottom: 1px solid #eceee8`. Rodapé de paginação mono com "1–10 de 412" e setas.

### 5. Mensalidades
1. **Faixa de 4 indicadores** em grid de **2 colunas** (evita gutter vazio): previsto no mês R$ 126.400 · recebido R$ 118.500 (93,7%) · em aberto R$ 7.900 (26 títulos, 6,3%) · atraso acima de 30d R$ 3.240.
2. **Tabela da competência** — header com título "Competência setembro/2026", chips Todos/Pagos/Pendentes/Atrasados e botão primário "Lançar mensalidades". Colunas: Matrícula · Associado · Vencimento · Valor (direita) · Forma (Pix, Boleto, Cartão rec., Isento) · Status (chip) · Ação (Cobrar / Recibo / Negociar / Ver).

### 6. Reserva de quadras
1. **Grade quadra × horário** (formato escolhido pelo usuário):
   - Header: data em Spectral 16px, navegação ← / hoje / →, legenda (Livre, Reservado, Aula, Manutenção).
   - Grade com `min-width: 760px` dentro de `overflow-x: auto`. Grid `62px repeat(6, minmax(0,1fr))`, gap 1px. Cabeçalho de coluna: nome da quadra 12px weight 600 + superfície mono 10px uppercase. Cada linha começa com o horário em mono 11px e tem `border-top: 1px solid #eceee8`.
   - Células como botões, `min-height` 40px (compacta) / 52px (confortável), padding 6/8, texto à esquerda, duas linhas (rótulo 11px + sub mono 9px):
     - Livre: `#fff`, borda `#e2e5df`, texto `#a6aba6`, sub "RESERVAR"; hover borda `#12572f`, fundo `#f4f7f2`, texto `#12572f`.
     - Reservado: fundo e borda `#12572f`, texto branco, nome do associado, sub "RESERVADO"; hover `#0b3d20`.
     - Aula: fundo e borda `#235f74`, texto branco, sub "AULA"; hover `#17475a`.
     - Manutenção: fundo `#e8e9e4`, borda `#d4d7d0`, texto `#6b7370`, sub "BLOQUEADO", `cursor: not-allowed`.
   - Quadras: Q1 e Q2 saibro, Q3 e Q4 rápida, Areia 1 beach, Society grama sintética. Horários de 2 em 2 horas, 07:00 → 21:00.
2. **Próximas reservas:** horário mono, quem, onde e chip de status.
3. **Nova reserva:** formulário 2 colunas (associado, quadra, data, horário), caixa de regras do clube em `#f4f7f2` e botão primário "Confirmar reserva".

### 7. Partidas e ranking
Grid `minmax(0,1.15fr) | minmax(0,1fr)`.
- **Ranking (pontos corridos):** chips de modalidade (Tênis simples / Tênis duplas / Beach tennis). Colunas: # · Jogador (nome + categoria 11px) · Pontos · J · V–D · Aprov. · Sequência (mono, "V V V D V") · Var. pos.
- **Registrar partida:** grid `minmax(0,1fr) 22px minmax(0,1fr)` com Jogador A / "vs" / Jogador B; placar em 3 campos mono centralizados; caixa de prévia mono explicando a regra (**vitória +3 pts, derrota +0, W.O. +1**) e o efeito no ranking; botão "Salvar resultado".
- **Últimas partidas:** data mono 11px, "Vencedor **d.** perdedor", meta (quadra · superfície · formato) e placar mono.

### 8. Área do associado
1. **Cabeçalho de perfil** — grid `minmax(0,1fr) | minmax(280px,340px)` com gap 1px sobre `#e2e5df`:
   - Esquerda: placeholder de foto 3x4 (78px, borda tracejada `#cfd3cc`, fundo listado, legenda mono 8px), nome Spectral 22px, linha mono com matrícula/categoria/data de ingresso, chips de situação e modalidades, botões "Editar dados" e "Dependentes (2)".
   - Direita: "Minha temporada" — 4 números mono 22px: 54 pts (4º geral), 18–7, 31 horas de quadra, 2 reservas ativas.
2. **Minhas mensalidades:** competência mono, valor, vencimento/pagamento, chip e link (Pagar / Recibo). Rodapé de aviso em `#fdf8ee` sobre o próximo vencimento.
3. **Minhas reservas:** quando (mono), quadra, parceiro, chip de status; abaixo, "Meus últimos resultados" com badge quadrado 18px (`V` verde / `D` `#9c2230`), adversário, placar e pontos ganhos.

## Interactions & Behavior
- **Login:** selecionar perfil define o destino — admin → Painel geral; associado → Minha área. O seletor precisa de feedback visual imediato.
- **Navegação:** sidebar troca a tela; o breadcrumb, o título e o botão primário do header mudam conforme a tela.
- **Alternar perfil:** botão na sidebar troca admin ↔ associado e leva à tela inicial do perfil. Em produção, isso é uma permissão ("ver como associado"), não troca de sessão.
- **Filtros:** chips filtram a lista no cliente no protótipo; em produção, filtro server-side com o contador refletindo o resultado.
- **Grade de quadras:** célula livre abre criação de reserva no slot; reservada abre detalhe/cancelamento; manutenção é inerte.
- **Hover:** definido em botões, chips, células da grade e links (`a:hover` → `#0b3d20` com sublinhado).
- **Regras de negócio embutidas no design (confirmar com o cliente):** até 2 reservas ativas por associado; 1h/dia em pico (18h–21h); mensalidade em atraso bloqueia novas reservas; baixa automática de Pix em até 2h; vitória vale 3 pontos.
- **Estados ausentes no protótipo e necessários na implementação:** loading, vazio, erro de formulário, confirmação de exclusão/cancelamento, sucesso de pagamento.
- **Responsivo:** desenhado para desktop. Header e barras de KPI já quebram em linha; tabelas e a grade usam `overflow-x: auto`. Abaixo de ~900px a sidebar deve virar menu recolhível (não desenhado).

## State Management
Estado do protótipo: `screen` (login | dashboard | associados | mensalidades | quadras | partidas | socio), `role` (admin | associado), `memberFilter`, `feeFilter`, `rankFilter`.

Em produção: rotas por tela; sessão e permissões no servidor; filtros como query params; dados por recurso — associados, mensalidades (competência, título, baixa), quadras/slots/reservas, partidas e ranking calculado. Ranking e indicadores do painel são derivados: calcular no back-end, não no cliente.

## Assets
Nenhuma imagem real. Dois placeholders a serem substituídos por material do clube:
- Hero do login: bloco de 132px com padrão listrado, legenda "foto da sede / quadras" (no protótipo atual o bloco está no painel esquerdo).
- Área do associado: placeholder de foto 3x4 do associado.

Logo: atualmente um quadrado `#d8e84f` com as iniciais em Spectral. Substituir pela marca real do clube. Nenhum ícone é usado — a interface é toda tipográfica e de quadrados coloridos, propositalmente.

## Files
- `Gestao Clube.dc.html` — protótipo completo: todas as 7 telas, navegação e dados de exemplo. Abre direto no navegador. A marcação está no template e os dados/estilos derivados no método `renderVals()` da classe de lógica no fim do arquivo.
