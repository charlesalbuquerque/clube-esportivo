import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { formatDateBR } from "@/lib/format";
import { AssociadoCard } from "./AssociadoCard";

type Partida = {
  id: number;
  jogador1_id: string;
  jogador2_id: string;
  placar1: number;
  placar2: number;
  data: string;
};

type Resultado = "vitoria" | "derrota" | "empate";

const RESULTADO_LABEL: Record<Resultado, string> = {
  vitoria: "Vitória",
  derrota: "Derrota",
  empate: "Empate",
};

const RESULTADO_CLASS: Record<Resultado, string> = {
  vitoria: "text-green-700",
  derrota: "text-red-700",
  empate: "text-brand-muted",
};

export async function UltimasPartidasCard() {
  const profile = await getCurrentProfile();

  let linhas: {
    id: number;
    data: string;
    resultado: Resultado;
    placar: string;
    adversario: string;
  }[] = [];
  let erro = false;

  try {
    if (!profile) throw new Error("Sem perfil.");

    const supabase = await createClient();

    const { data: partidas, error } = await supabase
      .from("partidas")
      .select("id, jogador1_id, jogador2_id, placar1, placar2, data")
      .or(`jogador1_id.eq.${profile.id},jogador2_id.eq.${profile.id}`)
      .order("data", { ascending: false })
      .limit(5);

    if (error) throw error;

    const historico = (partidas ?? []) as Partida[];

    // RLS de profiles só deixa o associado ler o próprio perfil — não dá
    // pra buscar o nome do adversário direto na tabela. get_ranking() é
    // SECURITY DEFINER e já traz o nome de qualquer um que tenha alguma
    // partida (todo adversário aqui necessariamente tem), então reusamos
    // ela em vez de abrir a RLS de profiles pra isso.
    const { data: ranking, error: rankingError } = await supabase.rpc(
      "get_ranking"
    );

    if (rankingError) throw rankingError;

    const nomesPorId = new Map(
      ((ranking ?? []) as { associado_id: string; nome: string }[]).map(
        (r) => [r.associado_id, r.nome]
      )
    );

    linhas = historico.map((p) => {
      const souJogador1 = p.jogador1_id === profile.id;
      const meuPlacar = souJogador1 ? p.placar1 : p.placar2;
      const placarAdversario = souJogador1 ? p.placar2 : p.placar1;
      const adversarioId = souJogador1 ? p.jogador2_id : p.jogador1_id;

      const resultado: Resultado =
        meuPlacar > placarAdversario
          ? "vitoria"
          : meuPlacar < placarAdversario
            ? "derrota"
            : "empate";

      return {
        id: p.id,
        data: p.data,
        resultado,
        placar: `${meuPlacar}–${placarAdversario}`,
        adversario: nomesPorId.get(adversarioId) ?? "—",
      };
    });
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <AssociadoCard title="Últimas partidas">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </AssociadoCard>
    );
  }

  if (linhas.length === 0) {
    return (
      <AssociadoCard title="Últimas partidas">
        <p className="text-sm text-brand-muted">
          Você ainda não tem partidas registradas.
        </p>
      </AssociadoCard>
    );
  }

  return (
    <AssociadoCard title="Últimas partidas">
      <ul className="space-y-2 text-sm">
        {linhas.map((l) => (
          <li key={l.id} className="flex items-center justify-between">
            <span className="text-brand-ink">
              {formatDateBR(l.data)} · vs {l.adversario}
            </span>
            <span className={`font-medium ${RESULTADO_CLASS[l.resultado]}`}>
              {RESULTADO_LABEL[l.resultado]} ({l.placar})
            </span>
          </li>
        ))}
      </ul>
    </AssociadoCard>
  );
}
