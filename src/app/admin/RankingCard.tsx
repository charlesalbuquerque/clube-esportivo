import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "./DashboardCard";

type Linha = { associado_id: string; full_name: string; pontos: number };

export async function RankingCard() {
  const supabase = await createClient();

  let top3: Linha[] = [];
  let erro = false;

  try {
    const { data, error } = await supabase
      .from("ranking")
      .select("associado_id, full_name, pontos")
      .order("pontos", { ascending: false })
      .limit(3);

    if (error) throw error;

    top3 = data ?? [];
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <DashboardCard title="Top 3 do ranking">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </DashboardCard>
    );
  }

  if (top3.length === 0) {
    return (
      <DashboardCard title="Top 3 do ranking">
        <p className="text-sm text-zinc-600">
          Nenhuma partida registrada ainda.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Top 3 do ranking">
      <ol className="space-y-1 text-sm">
        {top3.map((r, i) => (
          <li
            key={r.associado_id}
            className="flex justify-between text-zinc-700"
          >
            <span>
              {i + 1}. {r.full_name}
            </span>
            <span className="text-zinc-500">{r.pontos} pts</span>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}
