"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createQuadra(
  redirectTo: string,
  formData: FormData
) {
  const supabase = await createClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!nome || !tipo) {
    throw new Error("Nome e tipo da quadra são obrigatórios.");
  }

  const { error } = await supabase
    .from("quadras")
    .insert({
      nome,
      tipo,
      descricao: descricao || null,
    });

  if (error) {
    console.error("Erro ao criar quadra:", error);
    throw new Error("Não foi possível cadastrar a quadra.");
  }

  revalidatePath("/admin/quadras");
  revalidatePath(redirectTo);

  return { success: true };
}

export async function createHorario(
  quadraId: number,
  redirectTo: string,
  formData: FormData
) {
  const supabase = await createClient();

  const diaSemana = Number(formData.get("dia_semana"));
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const horaFim = String(formData.get("hora_fim") ?? "");

  if (
    !Number.isInteger(diaSemana) ||
    diaSemana < 0 ||
    diaSemana > 6
  ) {
    throw new Error("Dia da semana inválido.");
  }

  if (!horaInicio || !horaFim) {
    throw new Error("Horário inicial e final são obrigatórios.");
  }

  if (horaInicio >= horaFim) {
    throw new Error(
      "O horário inicial deve ser menor que o horário final."
    );
  }

  const { error } = await supabase
    .from("quadra_horarios")
    .insert({
      quadra_id: quadraId,
      dia_semana: diaSemana,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      ativo: true,
    });

  if (error) {
    console.error("Erro ao criar horário:", error);

    if (error.code === "23505") {
      throw new Error(
        "Esse horário já está cadastrado para esta quadra."
      );
    }

    throw new Error("Não foi possível cadastrar o horário.");
  }

  revalidatePath("/admin/quadras");
  revalidatePath(redirectTo);

  return { success: true };
}

export async function deleteHorario(
  horarioId: number,
  redirectTo: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("quadra_horarios")
    .delete()
    .eq("id", horarioId);

  if (error) {
    console.error("Erro ao excluir horário:", error);
    throw new Error("Não foi possível excluir o horário.");
  }

  revalidatePath("/admin/quadras");
  revalidatePath(redirectTo);

  return { success: true };
}

export async function toggleHorario(
  horarioId: number,
  ativo: boolean,
  redirectTo: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("quadra_horarios")
    .update({
      ativo,
    })
    .eq("id", horarioId);

  if (error) {
    console.error("Erro ao alterar horário:", error);
    throw new Error("Não foi possível alterar o horário.");
  }

  revalidatePath("/admin/quadras");
  revalidatePath(redirectTo);

  return { success: true };
}