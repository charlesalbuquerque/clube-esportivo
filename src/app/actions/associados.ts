"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Atualiza o status (ativo/inativo) de um associado.
 */
export async function updateAssociadoStatus(
  id: string,
  redirectTo: string,
  formData: FormData
) {
  const status = formData.get("status");
  const separator = redirectTo.includes("?") ? "&" : "?";

  if (status !== "ativo" && status !== "inativo") {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Status inválido."
      )}`
    );
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
 * Atualiza nome e telefone do próprio usuário logado.
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
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/associado/perfil");
  revalidatePath("/associado");

  return { message: "Perfil atualizado." };
}

/**
 * Cria um novo associado.
 *
 * O usuário é criado no Supabase Auth usando o cliente administrativo.
 * O trigger handle_new_user() cria automaticamente o registro em profiles.
 */
export async function createAssociado(
  redirectTo: string,
  formData: FormData
) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const separator = redirectTo.includes("?") ? "&" : "?";

  /*
   * Validações
   */
  if (!fullName) {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Informe o nome do associado."
      )}`
    );
  }

  if (!email || !email.includes("@")) {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Informe um e-mail válido."
      )}`
    );
  }

  if (password.length < 6) {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "A senha deve ter pelo menos 6 caracteres."
      )}`
    );
  }

  /*
   * Verifica se quem está executando a ação é administrador.
   *
   * O cliente administrativo ignora RLS, então essa verificação
   * precisa acontecer antes de utilizá-lo.
   */
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Sessão expirada. Faça login novamente."
      )}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Você não tem permissão para cadastrar associados."
      )}`
    );
  }

  /*
   * Cliente administrativo do Supabase.
   */
  const supabaseAdmin = createAdminClient();

  /*
   * Cria o usuário no Supabase Auth.
   *
   * O trigger handle_new_user() criará automaticamente
   * o registro correspondente na tabela profiles.
   */
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (authError || !authData.user) {
    console.error("Erro ao criar associado:", authError);

    redirect(
      `${redirectTo}${separator}erro=${encodeURIComponent(
        "Não foi possível cadastrar o associado. Verifique se o e-mail já está cadastrado."
      )}`
    );
  }

  /*
   * O trigger já criou o profile.
   *
   * Agora adicionamos o telefone, caso tenha sido informado.
   */
  if (phone) {
    const { error: phoneError } = await supabaseAdmin
      .from("profiles")
      .update({
        phone,
      })
      .eq("id", authData.user.id);

    if (phoneError) {
      console.error(
        "Erro ao atualizar telefone do associado:",
        phoneError
      );

      /*
       * Se o profile não puder ser atualizado, removemos
       * o usuário criado para não deixar cadastro incompleto.
       */
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      redirect(
        `${redirectTo}${separator}erro=${encodeURIComponent(
          "O associado não pôde ser cadastrado completamente."
        )}`
      );
    }
  }

  /*
   * Atualiza as páginas que dependem dos associados.
   */
  revalidatePath("/admin/associados");
  revalidatePath("/admin");
  revalidatePath("/admin/partidas");

  /*
   * Volta para a lista de associados.
   */
  redirect(
    `${redirectTo}${separator}sucesso=${encodeURIComponent(
      "Associado cadastrado com sucesso."
    )}`
  );
}