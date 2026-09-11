"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Atualiza o status (ativo/inativo) de um associado. Ação de admin — RLS
 * garante isso no banco (policy "admin edita qualquer perfil"); se quem
 * chamar não for admin, o update simplesmente não afeta nenhuma linha e
 * tratamos isso como erro de permissão.
 *
 * `id` e `redirectTo` vêm de `.bind(null, id, redirectTo)` no form; o
 * FormData chega como último argumento, preenchido pelo próprio React.
 */
export async function updateAssociadoStatus(
  id: string,
  redirectTo: string,
  formData: FormData
) {
  const status = formData.get("status");
  const separator = redirectTo.includes("?") ? "&" : "?";

  if (status !== "ativo" && status !== "inativo") {
    redirect(`${redirectTo}${separator}erro=${encodeURIComponent("Status inválido.")}`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Não foi possível atualizar o status (sem permissão?)."
      )}`
    );
  }

  revalidatePath("/admin/associados");
  revalidatePath(`/admin/associados/${id}`);
  redirect(redirectTo);
}
