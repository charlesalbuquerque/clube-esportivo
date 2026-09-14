import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "./DashboardCard";

export async function AssociadosCard() {
  const supabase = await createClient();

  let ativos = 0;
  let inativos = 0;
  let erro = false;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("status")
      .eq("role", "associado");

    if (error) throw error;

    ativos = data.filter((p) => p.status === "ativo").length;
    inativos = data.filter((p) => p.status === "inativo").length;
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <DashboardCard title="Associados">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Associados">
      <p className="text-3xl font-semibold text-ink">
        {ativos + inativos}
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        {ativos} ativos · {inativos} inativos
      </p>
      <Link
        href="/admin/associados"
        className="mt-3 inline-block text-sm text-ink-muted underline"
      >
        Ver todos
      </Link>
    </DashboardCard>
  );
}
