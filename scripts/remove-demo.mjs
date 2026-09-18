// ============================================================
// Remove os associados de demonstração criados por seed-demo.mjs
//
// Apaga só os usuários cujo e-mail termina em @seed.conexaoesportiva.local
// (o domínio fixo usado pelo seed) via Supabase Admin API. Como
// profiles.id referencia auth.users(id) on delete cascade, e
// mensalidades/reservas/partidas/partida_participantes referenciam
// profiles(id) on delete cascade, apagar o auth user já remove tudo
// que pertence a ele em cascata. Quadras/quadra_horarios criados pelo
// seed NÃO são tocados por este script (não são "associado").
//
// COMO RODAR:
//   node scripts/remove-demo.mjs
// (mesma SUPABASE_SERVICE_ROLE_KEY no .env.local usada pelo seed)
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
    "Faltam variáveis de ambiente. Defina NEXT_PUBLIC_SUPABASE_URL e " +
      "SUPABASE_SERVICE_ROLE_KEY (no .env.local, nunca no código) antes de rodar."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DOMINIO_DEMO = "seed.conexaoesportiva.local";

async function main() {
  let removidos = 0;
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const usuariosDemo = data.users.filter((u) =>
      u.email?.endsWith(`@${DOMINIO_DEMO}`)
    );

    for (const usuario of usuariosDemo) {
      const { error: erroDelete } = await supabase.auth.admin.deleteUser(usuario.id);
      if (erroDelete) throw erroDelete;
      console.log(`  - removido: ${usuario.email}`);
      removidos++;
    }

    if (data.users.length < perPage) break;
    page++;
  }

  console.log(
    `\n${removidos} associado(s) de demonstração removido(s) (mensalidades, ` +
      "reservas e partidas deles saíram junto, em cascata)."
  );
}

main().catch((error) => {
  console.error("\nErro ao remover os associados de demonstração:", error.message ?? error);
  process.exit(1);
});
