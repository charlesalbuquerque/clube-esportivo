"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isModalidade } from "@/app/admin/partidas/modalidades";

type Participante = {
  associado_id: string;
  lado: "lado_a" | "lado_b";
};

type SetEntry = {
  a: number;
  b: number;
};

function parseSets(raw: FormDataEntryValue | null): SetEntry[] {
  let sets: unknown;

  try {
    sets = JSON.parse(String(raw ?? "[]"));
  } catch {
    throw new Error("Placar por set inválido.");
  }

  if (!Array.isArray(sets) || sets.length === 0) {
    throw new Error("Registre o placar de pelo menos um set.");
  }

  for (const set of sets) {
    if (
      typeof set !== "object" ||
      set === null ||
      !Number.isInteger((set as SetEntry).a) ||
      !Number.isInteger((set as SetEntry).b) ||
      (set as SetEntry).a < 0 ||
      (set as SetEntry).b < 0
    ) {
      throw new Error("Placar por set inválido.");
    }
  }

  return sets as SetEntry[];
}

export async function createPartida(
  redirectTo: string,
  formData: FormData
) {
  const supabase = await createClient();

  const tipo = String(formData.get("tipo") ?? "").trim();
  const modalidade = String(formData.get("modalidade") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();
  const quadraIdRaw = String(formData.get("quadra_id") ?? "").trim();
  const jogador1Id = String(formData.get("jogador1_id") ?? "").trim();
  const jogador2Id = String(formData.get("jogador2_id") ?? "").trim();

  if (tipo !== "individual" && tipo !== "equipe") {
    throw new Error("Tipo de partida inválido.");
  }

  if (!isModalidade(modalidade)) {
    throw new Error("Modalidade inválida.");
  }

  if (!data) {
    throw new Error("A data da partida é obrigatória.");
  }

  const quadraId = quadraIdRaw ? Number(quadraIdRaw) : null;

  if (quadraIdRaw && !Number.isInteger(quadraId)) {
    throw new Error("Quadra inválida.");
  }

  const sets = parseSets(formData.get("sets"));

  // placar1/placar2 são o agregado (sets ganhos) — derivado do placar por
  // set, nunca aceito direto do cliente, pra não deixar os dois discordarem.
  let placar1 = 0;
  let placar2 = 0;

  for (const set of sets) {
    if (set.a > set.b) placar1 += 1;
    else if (set.b > set.a) placar2 += 1;
  }

  /*
   * PARTIDA INDIVIDUAL
   */
  if (tipo === "individual") {
    if (!jogador1Id || !jogador2Id) {
      throw new Error("Selecione os dois jogadores.");
    }

    if (jogador1Id === jogador2Id) {
      throw new Error("Os jogadores precisam ser diferentes.");
    }

    const { error } = await supabase
      .from("partidas")
      .insert({
        tipo,
        modalidade,
        jogador1_id: jogador1Id,
        jogador2_id: jogador2Id,
        placar1,
        placar2,
        sets,
        quadra_id: quadraId,
        data,
      });

    if (error) {
      console.error("Erro ao criar partida individual:", error);
      throw new Error("Não foi possível registrar a partida.");
    }
  }

  /*
   * PARTIDA EM EQUIPE
   */
  if (tipo === "equipe") {
    const participantesRaw = formData.get("participantes");

    if (!participantesRaw) {
      throw new Error("Adicione os participantes das equipes.");
    }

    let participantes: Participante[];

    try {
      participantes = JSON.parse(String(participantesRaw));
    } catch {
      throw new Error("Participantes inválidos.");
    }

    if (!Array.isArray(participantes) || participantes.length < 2) {
      throw new Error(
        "A partida precisa ter pelo menos dois participantes."
      );
    }

    const ladoA = participantes.filter(
      (participante) => participante.lado === "lado_a"
    );

    const ladoB = participantes.filter(
      (participante) => participante.lado === "lado_b"
    );

    if (ladoA.length === 0 || ladoB.length === 0) {
      throw new Error(
        "As duas equipes precisam ter pelo menos um participante."
      );
    }

    const associados = participantes.map(
      (participante) => participante.associado_id
    );

    const associadosUnicos = new Set(associados);

    if (associadosUnicos.size !== associados.length) {
      throw new Error(
        "Um associado não pode participar duas vezes da mesma partida."
      );
    }

    /*
     * Mantemos jogador1_id e jogador2_id para compatibilidade
     * com a estrutura atual da tabela partidas.
     *
     * Em partidas de equipe:
     * jogador1_id = primeiro participante do lado A
     * jogador2_id = primeiro participante do lado B
     *
     * Os demais participantes ficam em partida_participantes.
     */
    const { data: partida, error: partidaError } = await supabase
      .from("partidas")
      .insert({
        tipo,
        modalidade,
        jogador1_id: ladoA[0].associado_id,
        jogador2_id: ladoB[0].associado_id,
        placar1,
        placar2,
        sets,
        quadra_id: quadraId,
        data,
      })
      .select("id")
      .single();

    if (partidaError || !partida) {
      console.error(
        "Erro ao criar partida em equipe:",
        partidaError
      );

      throw new Error(
        "Não foi possível registrar a partida."
      );
    }

    const participantesParaInserir = participantes.map(
      (participante) => ({
        partida_id: partida.id,
        associado_id: participante.associado_id,
        lado: participante.lado,
      })
    );

    const { error: participantesError } = await supabase
      .from("partida_participantes")
      .insert(participantesParaInserir);

    if (participantesError) {
      console.error(
        "Erro ao registrar participantes da partida:",
        participantesError
      );

      /*
       * Se os participantes não forem registrados,
       * removemos a partida criada para evitar
       * deixar dados incompletos no banco.
       */
      await supabase
        .from("partidas")
        .delete()
        .eq("id", partida.id);

      throw new Error(
        "Não foi possível registrar os participantes da partida."
      );
    }
  }

  /*
   * Atualiza as páginas que dependem desses dados.
   */
  revalidatePath("/admin/partidas");
  revalidatePath("/admin");
  revalidatePath("/associado");
  revalidatePath("/associado/ranking");

  /*
   * Server Actions usadas diretamente pelo <form action={...}>
   * precisam retornar void.
   */
  return;
}