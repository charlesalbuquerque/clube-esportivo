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

export type ProfileFormState = {
  error?: string;
  message?: string;
};

/**
 * Atualiza nome e telefone do próprio usuário logado. Não aceita role nem
 * status — mesmo que aceitasse, o trigger prevent_self_role_status_change
 * (schema.sql) reverte qualquer tentativa de mudar essas colunas se quem
 * edita não é admin.
 */
export async function updateOwnProfile(
  _prevState: ProfileFormState | undefined,
  formData: FormData
): Promise<ProfileFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) {
    return { error: "Informe seu nome." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/associado/perfil");
  revalidatePath("/associado");
  return { message: "Perfil atualizado." };
}
