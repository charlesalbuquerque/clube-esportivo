import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Lê/escreve a sessão do usuário via cookies (next/headers).
 *
 * Chamar `await createClient()` de dentro de um Server Component, Server Action
 * ou Route Handler — nunca de um arquivo "use client".
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de um Server Component (não pode escrever cookies).
            // Pode ser ignorado se houver um Proxy renovando a sessão.
          }
        },
      },
    }
  );
}
