import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link de confirmação de e-mail (Supabase Auth redireciona pra cá
 * com ?code=... depois que o usuário confirma o cadastro). Troca o código
 * pela sessão e manda pra área do associado.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/associado`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
