"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function withErro(redirectTo: string, mensagem: string): never {
  const separator = redirectTo.includes("?") ? "&" : "?";
  redirect(`${redirectTo}${separator}erro=${encodeURIComponent(mensagem)}`);
}

/**
 * Lança uma nova mensalidade pra um associado. Ação de admin — RLS garante
 * isso no banco (policy "admin gerencia mensalidades", cobre INSERT/UPDATE).
 *
 * `redirectTo` vem de `.bind(null, redirectTo)` no form.
 */
export async function createMensalidade(redirectTo: string, formData: FormData) {
  const associadoId = String(formData.get("associado_id") ?? "");
  const mes = String(formData.get("mes") ?? ""); // input type="month" -> "AAAA-MM"
  const valorRaw = String(formData.get("valor") ?? "");
  const valor = Number(valorRaw.replace(",", "."));

  if (!associadoId) {
    withErro(redirectTo, "Selecione um associado.");
  }
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    withErro(redirectTo, "Informe o mês de referência.");
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    withErro(redirectTo, "Informe um valor válido.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("mensalidades").insert({
    associado_id: associadoId,
    referencia_mes: `${mes}-01`,
    valor,
  });

  if (error) {
    if (error.code === "23505") {
      withErro(redirectTo, "Esse associado já tem mensalidade lançada nesse mês.");
    }
    withErro(redirectTo, "Não foi possível lançar a mensalidade (sem permissão?).");
  }

  revalidatePath("/admin/mensalidades");
  redirect(redirectTo);
}

/**
 * Marca uma mensalidade como paga: status='pago' + data_pagamento = hoje.
 * Ação de admin. `id` e `redirectTo` vêm de `.bind(null, id, redirectTo)`.
 */
export async function marcarComoPaga(
  id: number,
  redirectTo: string,
  _formData: FormData
) {
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("mensalidades")
    .update({ status: "pago", data_pagamento: hoje })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    withErro(redirectTo, "Não foi possível marcar como paga (sem permissão?).");
  }

  revalidatePath("/admin/mensalidades");
  redirect(redirectTo);
}
