import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "./DashboardCard";

/**
 * As tabelas quadras/reservas já existem no banco, mas o módulo que cria
 * dados nelas (Quadras/Reservas) ainda está sendo construído em paralelo.
 * Cada contagem tem seu próprio try/catch: se a tabela estiver vazia,
 * mostra "0" normalmente; só mostra "—" se a query em si falhar.
 */
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
    const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
    <DashboardCard title="Quadras e reservas">
      <p className="text-3xl font-semibold text-zinc-900">
        {totalQuadras ?? "—"}
      </p>
      <p className="mt-1 text-sm text-zinc-600">quadras cadastradas</p>

      <p className="mt-3 text-3xl font-semibold text-zinc-900">
        {reservasHoje ?? "—"}
      </p>
      <p className="mt-1 text-sm text-zinc-600">reservas confirmadas hoje</p>
    </DashboardCard>
  );
}
