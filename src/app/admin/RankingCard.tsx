import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "./DashboardCard";

type Linha = {
  associado_id: string;
  nome: string;
  partidas: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
};

export async function RankingCard() {
  const supabase = await createClient();

  let top3: Linha[] = [];
  let erro = false;

  try {
    const { data, error } = await supabase.rpc("get_ranking");

    if (error) {
      console.error("Erro ao carregar ranking:", error);
      throw error;
    }

    top3 = (data ?? []).slice(0, 3);
  } catch (error) {
    console.error("Erro no RankingCard:", error);
    erro = true;
  }

  if (erro) {
    return (
      <DashboardCard title="Top 3 do ranking">
        <p className="text-sm text-red-600">
          Não foi possível carregar.
        </p>
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
      <ol className="space-y-2 text-sm">
        {top3.map((r, i) => (
          <li
            key={r.associado_id}
            className="flex items-center justify-between text-zinc-700"
          >
            <span>
              {i + 1}. {r.nome}
            </span>

            <span className="font-medium text-zinc-600">
              {r.pontos} pts
            </span>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}