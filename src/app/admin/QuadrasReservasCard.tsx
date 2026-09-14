import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "./DashboardCard";

export async function QuadrasReservasCard() {
  const supabase = await createClient();

  let totalQuadras: number | null = null;

  try {
    const { count, error } = await supabase
      .from("quadras")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    totalQuadras = count ?? 0;
  } catch {
    totalQuadras = null;
  }

  let reservasHoje: number | null = null;

  try {
    const now = new Date();

    const hoje = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const { count, error } = await supabase
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .eq("data", hoje)
      .eq("status", "confirmada");

    if (error) throw error;

    reservasHoje = count ?? 0;
  } catch {
    reservasHoje = null;
  }

  return (
    <Link href="/admin/quadras" className="block">
      <DashboardCard title="Quadras e reservas">
        <p className="text-3xl font-semibold text-ink">
          {totalQuadras ?? "—"}
        </p>

        <p className="mt-1 text-sm text-ink-muted">
          quadras cadastradas
        </p>

        <p className="mt-3 text-3xl font-semibold text-ink">
          {reservasHoje ?? "—"}
        </p>

        <p className="mt-1 text-sm text-ink-muted">
          reservas confirmadas hoje
        </p>

        <p className="mt-4 text-xs font-medium text-ink-muted">
          Clique para gerenciar →
        </p>
      </DashboardCard>
    </Link>
  );
}