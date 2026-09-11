import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  role: "admin" | "associado";
  phone: string | null;
  status: "ativo" | "inativo";
  joined_at: string;
  created_at: string;
};

/**
 * Pega o usuário logado (da sessão) e o profile correspondente na tabela
 * `profiles` (com o `role`, usado pra checar permissão de admin).
 *
 * Uso: SÓ em Server Components, Server Actions e Route Handlers
 * (não pode ser chamado de componentes "use client").
 *
 *   import { getCurrentProfile } from "@/lib/auth";
 *
 *   export default async function MinhaPage() {
 *     const profile = await getCurrentProfile();
 *     if (!profile) {
 *       // sem sessão — normalmente não deveria acontecer em rota protegida,
 *       // já que o proxy.ts redireciona pro /login antes de chegar aqui
 *       return null;
 *     }
 *     if (profile.role === "admin") { ... }
 *   }
 *
 * `cache()` garante que, mesmo se `getCurrentProfile()` for chamado várias
 * vezes durante o mesmo request (layout + page, por exemplo), só é feita
 * uma consulta ao Supabase.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
});
