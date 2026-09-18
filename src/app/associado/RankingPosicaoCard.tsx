import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { AssociadoCard } from "./AssociadoCard";

type Linha = {
  associado_id: string;
  nome: string;
  pontos: number;
};

export async function RankingPosicaoCard() {
  const profile = await getCurrentProfile();

  let posicao: number | null = null;
  let pontos: number | null = null;
  let total: number | null = null;
  let erro = false;

  try {
    if (!profile) throw new Error("Sem perfil.");

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_ranking");

    if (error) throw error;

    const ranking = (data ?? []) as Linha[];
    const indice = ranking.findIndex((r) => r.associado_id === profile.id);

    if (indice !== -1) {
      posicao = indice + 1;
      pontos = ranking[indice].pontos;
      total = ranking.length;
    }
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <AssociadoCard title="Ranking">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </AssociadoCard>
    );
  }

  if (posicao === null) {
    return (
      <AssociadoCard title="Ranking">
        <p className="text-sm text-brand-muted">
          Você ainda não tem partidas registradas.
        </p>
      </AssociadoCard>
    );
  }

  return (
    <AssociadoCard title="Ranking">
      <p className="text-2xl font-semibold text-brand-ink">
        Você está em {posicao}º lugar geral
      </p>
      <p className="mt-1 text-sm text-brand-muted">
        {pontos} pts{total ? ` · entre ${total} associados no ranking` : ""}
      </p>
    </AssociadoCard>
  );
}
