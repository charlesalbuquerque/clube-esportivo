import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { DashboardCard } from "./DashboardCard";

export async function MensalidadesCard() {
  const supabase = await createClient();

  let pagas = 0;
  let pendentes = 0;
  let atrasadas = 0;
  let valorEmAberto = 0;
  let erro = false;

  try {
    // Mês corrente no fuso do servidor — não usa toISOString() (converte
    // pra UTC, pode virar o mês perto da virada do dia).
    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("mensalidades")
      .select("status, valor")
      .eq("referencia_mes", mesAtual);

    if (error) throw error;

    pagas = data.filter((m) => m.status === "pago").length;
    pendentes = data.filter((m) => m.status === "pendente").length;
    atrasadas = data.filter((m) => m.status === "atrasado").length;
    valorEmAberto = data
      .filter((m) => m.status === "pendente" || m.status === "atrasado")
      .reduce((soma, m) => soma + Number(m.valor), 0);
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <DashboardCard title="Mensalidades do mês">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Mensalidades do mês">
      <p className="text-sm text-ink-muted">
        {pagas} pagas · {pendentes} pendentes · {atrasadas} atrasadas
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink">
        {formatBRL(valorEmAberto)}
      </p>
      <p className="mt-1 text-sm text-ink-muted">em aberto</p>
      <Link
        href="/admin/mensalidades"
        className="mt-3 inline-block text-sm text-ink-muted underline"
      >
        Ver todas
      </Link>
    </DashboardCard>
  );
}
