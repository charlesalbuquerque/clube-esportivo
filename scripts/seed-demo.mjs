// ============================================================
// Seed de dados de demonstração — Conexão Esportiva
//
// Popula o banco com associados, mensalidades, quadras, horários,
// reservas e partidas realistas pra apresentação. Idempotente na
// parte de associados/quadras/mensalidades/reservas (roda de novo
// sem duplicar); partidas são sempre inseridas de novo se o script
// rodar mais de uma vez (não têm uma chave natural pra dedupe).
//
// COMO RODAR:
//   1. Adicione SUPABASE_SERVICE_ROLE_KEY=<sua chave> no .env.local
//      (arquivo já ignorado pelo git — NUNCA cole a chave em código
//      nem a compartilhe fora do seu ambiente local). Pegue a chave
//      em Supabase → Project Settings → API → service_role.
//   2. node scripts/seed-demo.mjs
//
// A service role key ignora RLS — por isso o script consegue criar
// dado em nome de qualquer associado sem precisar logar como cada um.
// ============================================================

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function carregarEnvLocal() {
  const caminho = new URL("../.env.local", import.meta.url);
  if (!existsSync(caminho)) return;

  const conteudo = readFileSync(caminho, "utf8");
  for (const linha of conteudo.split("\n")) {
    const l = linha.trim();
    if (!l || l.startsWith("#")) continue;
    const igual = l.indexOf("=");
    if (igual === -1) continue;
    const chave = l.slice(0, igual).trim();
    const valor = l.slice(igual + 1).trim();
    if (!(chave in process.env)) process.env[chave] = valor;
  }
}

carregarEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltam variáveis de ambiente. Defina NEXT_PUBLIC_SUPABASE_URL (já está " +
      "no .env.local) e SUPABASE_SERVICE_ROLE_KEY (adicione no .env.local, " +
      "nunca no código) antes de rodar este script."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SENHA_DEMO = "Demo12345!";
const DOMINIO_DEMO = "seed.conexaoesportiva.local";

function normalizarEmail(nome) {
  return (
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .join(".") + `@${DOMINIO_DEMO}`
  );
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function primeiroDiaDoMes(offsetMeses) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMeses);
  return toISODate(d);
}

// Próxima (ou última) data com um determinado dia da semana (0=domingo).
function dataParaDiaSemana(diaSemana, { semanas = 0, futuro = true } = {}) {
  const hoje = new Date();
  const d = new Date(hoje);
  if (futuro) {
    const diff = (diaSemana - hoje.getDay() + 7) % 7;
    d.setDate(hoje.getDate() + diff + semanas * 7);
  } else {
    const diff = (hoje.getDay() - diaSemana + 7) % 7;
    d.setDate(hoje.getDate() - diff - semanas * 7);
  }
  return toISODate(d);
}

// ------------------------------------------------------------
// 1) ASSOCIADOS
// ------------------------------------------------------------

const ASSOCIADOS = [
  { nome: "Mariana Costa Lima", status: "ativo" },
  { nome: "Rafael Souza Martins", status: "ativo" },
  { nome: "Beatriz Almeida Rocha", status: "ativo" },
  { nome: "Gabriel Oliveira Santos", status: "ativo" },
  { nome: "Fernanda Ribeiro Carvalho", status: "ativo" },
  { nome: "Lucas Pereira Gomes", status: "ativo" },
  { nome: "Camila Ferreira Dias", status: "ativo" },
  { nome: "Bruno Carvalho Teixeira", status: "ativo" },
  { nome: "Thiago Almeida Barros", status: "inativo" },
  { nome: "Juliana Ferreira Nunes", status: "inativo" },
];

async function upsertAssociado(associado) {
  const { data: existente, error: erroBusca } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("full_name", associado.nome)
    .eq("role", "associado")
    .maybeSingle();

  if (erroBusca) throw erroBusca;

  if (existente) {
    if (existente.status !== associado.status) {
      const { error: erroUpdate } = await supabase
        .from("profiles")
        .update({ status: associado.status })
        .eq("id", existente.id);
      if (erroUpdate) throw erroUpdate;
    }
    return existente.id;
  }

  const email = normalizarEmail(associado.nome);

  const { data: criado, error: erroCriar } = await supabase.auth.admin.createUser({
    email,
    password: SENHA_DEMO,
    email_confirm: true,
    user_metadata: { full_name: associado.nome },
  });

  if (erroCriar) throw erroCriar;

  const userId = criado.user.id;

  if (associado.status === "inativo") {
    const { error: erroStatus } = await supabase
      .from("profiles")
      .update({ status: "inativo" })
      .eq("id", userId);
    if (erroStatus) throw erroStatus;
  }

  return userId;
}

// ------------------------------------------------------------
// 2) QUADRAS + HORÁRIOS
// ------------------------------------------------------------

const QUADRAS = [
  {
    nome: "Quadra de Tênis 1",
    tipo: "tenis",
    descricao: "Saibro",
    horarios: [
      { dia_semana: 1, hora_inicio: "07:00", hora_fim: "08:00" },
      { dia_semana: 3, hora_inicio: "07:00", hora_fim: "08:00" },
    ],
  },
  {
    nome: "Quadra de Tênis 2",
    tipo: "tenis",
    descricao: "Piso rápido",
    horarios: [
      { dia_semana: 2, hora_inicio: "08:00", hora_fim: "09:00" },
      { dia_semana: 6, hora_inicio: "09:00", hora_fim: "10:00" },
    ],
  },
  {
    nome: "Arena Beach Tennis",
    tipo: "beach_tennis",
    descricao: "Areia coberta",
    horarios: [
      { dia_semana: 0, hora_inicio: "10:00", hora_fim: "11:00" },
      { dia_semana: 4, hora_inicio: "18:00", hora_fim: "19:00" },
    ],
  },
];

async function upsertQuadra(quadra) {
  const { data: existente, error: erroBusca } = await supabase
    .from("quadras")
    .select("id")
    .eq("nome", quadra.nome)
    .maybeSingle();

  if (erroBusca) throw erroBusca;

  let quadraId = existente?.id;

  if (!quadraId) {
    const { data: criada, error: erroCriar } = await supabase
      .from("quadras")
      .insert({ nome: quadra.nome, tipo: quadra.tipo, descricao: quadra.descricao })
      .select("id")
      .single();

    if (erroCriar) throw erroCriar;
    quadraId = criada.id;
  }

  for (const horario of quadra.horarios) {
    const { data: horarioExistente, error: erroBuscaHorario } = await supabase
      .from("quadra_horarios")
      .select("id")
      .eq("quadra_id", quadraId)
      .eq("dia_semana", horario.dia_semana)
      .eq("hora_inicio", horario.hora_inicio)
      .eq("hora_fim", horario.hora_fim)
      .maybeSingle();

    if (erroBuscaHorario) throw erroBuscaHorario;

    if (!horarioExistente) {
      const { error: erroCriarHorario } = await supabase.from("quadra_horarios").insert({
        quadra_id: quadraId,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
      });
      if (erroCriarHorario) throw erroCriarHorario;
    }
  }

  return quadraId;
}

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------

async function main() {
  console.log("Criando/atualizando associados...");
  const idsPorNome = new Map();
  for (const associado of ASSOCIADOS) {
    const id = await upsertAssociado(associado);
    idsPorNome.set(associado.nome, id);
    console.log(`  - ${associado.nome} (${associado.status}) -> ${id}`);
  }

  console.log("\nCriando/atualizando quadras e horários...");
  const idsQuadraPorNome = new Map();
  for (const quadra of QUADRAS) {
    const id = await upsertQuadra(quadra);
    idsQuadraPorNome.set(quadra.nome, id);
    console.log(`  - ${quadra.nome} -> ${id}`);
  }

  // Quadras já existentes no banco (criadas manualmente antes deste seed)
  // que também usamos pras reservas de demonstração, se existirem.
  const { data: quadrasExtras } = await supabase
    .from("quadras")
    .select("id, nome")
    .in("nome", ["Futebol Campo", "Quadra Futsal", "Quadra Vôlei"]);

  for (const q of quadrasExtras ?? []) {
    idsQuadraPorNome.set(q.nome, q.id);
  }

  // ------------------------------------------------------------
  // 3) MENSALIDADES — últimos 3 meses, mistura de status
  // ------------------------------------------------------------
  console.log("\nLançando mensalidades...");

  const meses = [primeiroDiaDoMes(-2), primeiroDiaDoMes(-1), primeiroDiaDoMes(0)];
  const VALOR_MENSAL = 180;

  // Status do mês atual por índice do associado (0-7 ativos, 8-9 inativos)
  // — escolhido pra gerar uma mistura visível no card de mensalidades do
  // admin (que só olha o mês corrente).
  const statusMesAtual = [
    "pago",
    "pago",
    "pendente",
    "pendente",
    "atrasado",
    "atrasado",
    "pendente",
    "pago",
    "atrasado",
    "atrasado",
  ];

  const mensalidadesParaInserir = [];

  ASSOCIADOS.forEach((associado, indice) => {
    const associadoId = idsPorNome.get(associado.nome);
    const inativo = associado.status === "inativo";

    meses.forEach((referenciaMes, indiceMes) => {
      const ehMesAtual = indiceMes === meses.length - 1;

      let status;
      if (inativo) {
        status = "atrasado";
      } else if (ehMesAtual) {
        status = statusMesAtual[indice];
      } else {
        status = "pago";
      }

      mensalidadesParaInserir.push({
        associado_id: associadoId,
        referencia_mes: referenciaMes,
        valor: VALOR_MENSAL,
        status,
        data_pagamento: status === "pago" ? `${referenciaMes.slice(0, 8)}05` : null,
      });
    });
  });

  const { error: erroMensalidades } = await supabase
    .from("mensalidades")
    .upsert(mensalidadesParaInserir, { onConflict: "associado_id,referencia_mes" });

  if (erroMensalidades) throw erroMensalidades;
  console.log(`  - ${mensalidadesParaInserir.length} mensalidades lançadas.`);

  // ------------------------------------------------------------
  // 4) RESERVAS — passadas e futuras
  // ------------------------------------------------------------
  console.log("\nCriando reservas...");

  const reservas = [
    {
      quadra: "Quadra de Tênis 1",
      dia: 1,
      hora_inicio: "07:00",
      hora_fim: "08:00",
      futuro: true,
      semanas: 0,
      associado: "Mariana Costa Lima",
    },
    {
      quadra: "Quadra de Tênis 2",
      dia: 2,
      hora_inicio: "08:00",
      hora_fim: "09:00",
      futuro: false,
      semanas: 1,
      associado: "Rafael Souza Martins",
    },
    {
      quadra: "Arena Beach Tennis",
      dia: 4,
      hora_inicio: "18:00",
      hora_fim: "19:00",
      futuro: true,
      semanas: 1,
      associado: "Fernanda Ribeiro Carvalho",
    },
    {
      quadra: "Quadra Futsal",
      dia: 2,
      hora_inicio: "19:00",
      hora_fim: "20:00",
      futuro: true,
      semanas: 0,
      associado: "Gabriel Oliveira Santos",
    },
    {
      quadra: "Futebol Campo",
      dia: 1,
      hora_inicio: "18:00",
      hora_fim: "19:00",
      futuro: false,
      semanas: 0,
      associado: "Lucas Pereira Gomes",
    },
    {
      quadra: "Quadra Vôlei",
      dia: 5,
      hora_inicio: "16:00",
      hora_fim: "17:00",
      futuro: true,
      semanas: 2,
      associado: "Camila Ferreira Dias",
    },
    {
      quadra: "Arena Beach Tennis",
      dia: 0,
      hora_inicio: "10:00",
      hora_fim: "11:00",
      futuro: false,
      semanas: 2,
      associado: "Thiago Almeida Barros",
    },
    {
      quadra: "Quadra de Tênis 1",
      dia: 3,
      hora_inicio: "07:00",
      hora_fim: "08:00",
      futuro: true,
      semanas: 1,
      associado: "Beatriz Almeida Rocha",
    },
  ]
    .filter((r) => idsQuadraPorNome.has(r.quadra))
    .map((r) => ({
      quadra_id: idsQuadraPorNome.get(r.quadra),
      associado_id: idsPorNome.get(r.associado),
      data: dataParaDiaSemana(r.dia, { semanas: r.semanas, futuro: r.futuro }),
      hora_inicio: r.hora_inicio,
      hora_fim: r.hora_fim,
      status: "confirmada",
    }));

  const { error: erroReservas } = await supabase
    .from("reservas")
    .upsert(reservas, { onConflict: "quadra_id,data,hora_inicio" });

  if (erroReservas) throw erroReservas;
  console.log(`  - ${reservas.length} reservas criadas.`);

  // ------------------------------------------------------------
  // 5) PARTIDAS — individuais e em equipe, várias modalidades
  // ------------------------------------------------------------
  console.log("\nRegistrando partidas...");

  const nome = (n) => idsPorNome.get(n);

  const partidasIndividuais = [
    {
      modalidade: "tenis_simples",
      jogador1: "Mariana Costa Lima",
      jogador2: "Beatriz Almeida Rocha",
      placar1: 2,
      placar2: 0,
      quadra: "Quadra de Tênis 1",
      diasAtras: 3,
    },
    {
      modalidade: "tenis_simples",
      jogador1: "Rafael Souza Martins",
      jogador2: "Gabriel Oliveira Santos",
      placar1: 2,
      placar2: 1,
      quadra: "Quadra de Tênis 2",
      diasAtras: 7,
    },
    {
      modalidade: "tenis_simples",
      jogador1: "Lucas Pereira Gomes",
      jogador2: "Bruno Carvalho Teixeira",
      placar1: 1,
      placar2: 1,
      quadra: "Quadra de Tênis 1",
      diasAtras: 10,
    },
    {
      modalidade: "beach_tennis",
      jogador1: "Fernanda Ribeiro Carvalho",
      jogador2: "Camila Ferreira Dias",
      placar1: 2,
      placar2: 0,
      quadra: "Arena Beach Tennis",
      diasAtras: 14,
    },
    {
      modalidade: "beach_tennis",
      jogador1: "Gabriel Oliveira Santos",
      jogador2: "Mariana Costa Lima",
      placar1: 2,
      placar2: 1,
      quadra: "Arena Beach Tennis",
      diasAtras: 17,
    },
  ];

  for (const p of partidasIndividuais) {
    const { error } = await supabase.from("partidas").insert({
      tipo: "individual",
      modalidade: p.modalidade,
      jogador1_id: nome(p.jogador1),
      jogador2_id: nome(p.jogador2),
      placar1: p.placar1,
      placar2: p.placar2,
      quadra_id: idsQuadraPorNome.get(p.quadra) ?? null,
      data: toISODate(new Date(Date.now() - p.diasAtras * 24 * 60 * 60 * 1000)),
    });
    if (error) throw error;
  }
  console.log(`  - ${partidasIndividuais.length} partidas individuais registradas.`);

  const partidasEquipe = [
    {
      modalidade: "tenis_duplas",
      ladoA: ["Rafael Souza Martins", "Lucas Pereira Gomes"],
      ladoB: ["Beatriz Almeida Rocha", "Fernanda Ribeiro Carvalho"],
      placar1: 2,
      placar2: 1,
      quadra: "Quadra de Tênis 2",
      diasAtras: 5,
    },
    {
      modalidade: "tenis_duplas",
      ladoA: ["Gabriel Oliveira Santos", "Camila Ferreira Dias"],
      ladoB: ["Bruno Carvalho Teixeira", "Mariana Costa Lima"],
      placar1: 2,
      placar2: 0,
      quadra: "Quadra de Tênis 1",
      diasAtras: 21,
    },
  ];

  for (const p of partidasEquipe) {
    const { data: partida, error: erroPartida } = await supabase
      .from("partidas")
      .insert({
        tipo: "equipe",
        modalidade: p.modalidade,
        jogador1_id: nome(p.ladoA[0]),
        jogador2_id: nome(p.ladoB[0]),
        placar1: p.placar1,
        placar2: p.placar2,
        quadra_id: idsQuadraPorNome.get(p.quadra) ?? null,
        data: toISODate(new Date(Date.now() - p.diasAtras * 24 * 60 * 60 * 1000)),
      })
      .select("id")
      .single();

    if (erroPartida) throw erroPartida;

    const participantes = [
      ...p.ladoA.map((n) => ({ partida_id: partida.id, associado_id: nome(n), lado: "lado_a" })),
      ...p.ladoB.map((n) => ({ partida_id: partida.id, associado_id: nome(n), lado: "lado_b" })),
    ];

    const { error: erroParticipantes } = await supabase
      .from("partida_participantes")
      .insert(participantes);

    if (erroParticipantes) throw erroParticipantes;
  }
  console.log(`  - ${partidasEquipe.length} partidas em equipe registradas.`);

  console.log("\nSeed concluído. Senha de todos os associados de demonstração:");
  console.log(`  ${SENHA_DEMO}`);
  console.log("E-mails no formato nome.sobrenome@" + DOMINIO_DEMO);
}

main().catch((error) => {
  console.error("\nErro ao rodar o seed:", error.message ?? error);
  process.exit(1);
});
