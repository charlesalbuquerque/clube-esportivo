import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { DashboardCard } from "./DashboardCard";

export async function MensalidadesCard() {
  const supabase = await createClient();

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

    const pagas = data.filter((m) => m.status === "pago").length;
    const pendentes = data.filter((m) => m.status === "pendente").length;
    const atrasadas = data.filter((m) => m.status === "atrasado").length;
    const valorEmAberto = data
      .filter((m) => m.status === "pendente" || m.status === "atrasado")
      .reduce((soma, m) => soma + Number(m.valor), 0);

    return (
      <DashboardCard title="Mensalidades do mês">
        <p className="text-sm text-zinc-600">
          {pagas} pagas · {pendentes} pendentes · {atrasadas} atrasadas
        </p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {formatBRL(valorEmAberto)}
        </p>
        <p className="mt-1 text-sm text-zinc-600">em aberto</p>
        <Link
          href="/admin/mensalidades"
          className="mt-3 inline-block text-sm text-zinc-600 underline"
        >
          Ver todas
        </Link>
      </DashboardCard>
    );
  } catch {
    return (
      <DashboardCard title="Mensalidades do mês">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </DashboardCard>
    );
  }
}
