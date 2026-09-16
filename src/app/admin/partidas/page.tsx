import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/format";
import { MODALIDADES, isModalidade, type Modalidade } from "./modalidades";
import RegistrarPartidaForm from "./RegistrarPartidaForm";

type RankingLinha = {
  associado_id: string;
  nome: string;
  partidas: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
};

type PartidaHistorico = {
  id: number;
  jogador1_id: string;
  jogador2_id: string;
  placar1: number;
  placar2: number;
  quadra_id: number | null;
  data: string;
};

function sequenciaDe(id: string, partidas: PartidaHistorico[]) {
  return partidas
    .filter((p) => p.jogador1_id === id || p.jogador2_id === id)
    .slice(0, 5)
    .map((p) => {
      const souJogador1 = p.jogador1_id === id;
      const meuPlacar = souJogador1 ? p.placar1 : p.placar2;
      const placarAdversario = souJogador1 ? p.placar2 : p.placar1;
      if (meuPlacar > placarAdversario) return "V";
      if (meuPlacar < placarAdversario) return "D";
      return "E";
    });
}

type RpcRanking = Promise<{
  data: RankingLinha[] | null;
  error: { message: string } | null;
}>;

export default async function PartidasPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; modalidade?: string }>;
}) {
  const { erro, modalidade: modalidadeParam } = await searchParams;

  const modalidadeAtiva: Modalidade =
    modalidadeParam && isModalidade(modalidadeParam)
      ? modalidadeParam
      : "tenis_simples";

  const supabase = await createClient();

  const [
    { data: associados },
    { data: quadras },
    { data: rankingSimples, error: rankingSimplesError },
    { data: rankingDuplas, error: rankingDuplasError },
    { data: rankingBeach, error: rankingBeachError },
    { data: partidasHistorico, error: historicoError },
    { data: todosPerfis },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "associado")
      .eq("status", "ativo")
      .order("full_name"),

    supabase.from("quadras").select("id, nome").order("nome"),

    supabase.rpc("get_ranking", {
      p_modalidade: "tenis_simples",
    }) as unknown as RpcRanking,

    supabase.rpc("get_ranking", {
      p_modalidade: "tenis_duplas",
    }) as unknown as RpcRanking,

    supabase.rpc("get_ranking", {
      p_modalidade: "beach_tennis",
    }) as unknown as RpcRanking,

    supabase
      .from("partidas")
      .select("id, jogador1_id, jogador2_id, placar1, placar2, quadra_id, data")
      .eq("modalidade", modalidadeAtiva)
      .order("data", { ascending: false })
      .limit(200) as unknown as Promise<{
      data: PartidaHistorico[] | null;
      error: { message: string } | null;
    }>,

    supabase.from("profiles").select("id, full_name"),
  ]);

  const rankingPorModalidade: Record<Modalidade, RankingLinha[]> = {
    tenis_simples: rankingSimples ?? [],
    tenis_duplas: rankingDuplas ?? [],
    beach_tennis: rankingBeach ?? [],
  };

  const errosPorModalidade: Record<Modalidade, { message: string } | null> = {
    tenis_simples: rankingSimplesError,
    tenis_duplas: rankingDuplasError,
    beach_tennis: rankingBeachError,
  };

  const ranking = rankingPorModalidade[modalidadeAtiva];
  const rankingError = errosPorModalidade[modalidadeAtiva];

  const nomesPorId = new Map(
    (todosPerfis ?? []).map((p) => [p.id, p.full_name as string])
  );
  const quadrasPorId = new Map(
    (quadras ?? []).map((q) => [q.id, q.nome as string])
  );

  const historico = partidasHistorico ?? [];
  const ultimasPartidas = historico.slice(0, 8);

  const redirectTo = "/admin/partidas";

  return (
    <div className="flex flex-col gap-[18px] px-6 pt-5 pb-10">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
          Esportivo
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold text-brand-ink">
          Partidas e ranking
        </h1>
      </div>

      {erro && (
        <div className="border border-[#f0d4d8] bg-[#fbeef0] px-4 py-3 text-sm text-[#9c2230]">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* RANKING */}
        <div className="border border-brand-border bg-brand-surface">
          <div className="border-b border-brand-border px-4 py-[13px]">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Ranking — pontos corridos
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-brand-border-soft px-4 py-3">
            {MODALIDADES.map((m) => (
              <Link
                key={m.value}
                href={`/admin/partidas?modalidade=${m.value}`}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  modalidadeAtiva === m.value
                    ? "bg-brand-green-700 text-white"
                    : "border border-brand-input-border bg-white text-brand-muted hover:bg-brand-surface-head"
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>

          {rankingError && (
            <p className="p-4 text-sm text-[#9c2230]">
              Não foi possível carregar o ranking.
            </p>
          )}

          {!rankingError && (!ranking || ranking.length === 0) && (
            <p className="p-4 text-sm text-brand-muted">
              Nenhuma partida registrada ainda.
            </p>
          )}

          {!rankingError && ranking && ranking.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-brand-surface-head text-left text-brand-muted">
                  <tr>
                    <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      #
                    </th>
                    <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Jogador
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Pontos
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em]">
                      J
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em]">
                      V–E–D
                    </th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Aprov.
                    </th>
                    <th className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Sequência
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((linha, i) => {
                    const aprov =
                      linha.partidas > 0
                        ? Math.round((linha.vitorias / linha.partidas) * 100)
                        : 0;
                    const seq = sequenciaDe(linha.associado_id, historico);

                    return (
                      <tr
                        key={linha.associado_id}
                        className="border-b border-brand-border-soft last:border-0"
                      >
                        <td className="whitespace-nowrap px-4 py-[9px] font-club-mono text-brand-muted">
                          {i + 1}
                        </td>
                        <td className="px-4 py-[9px] font-medium text-brand-ink">
                          {linha.nome}
                        </td>
                        <td className="whitespace-nowrap px-4 py-[9px] text-right font-club-mono text-brand-ink">
                          {linha.pontos}
                        </td>
                        <td className="whitespace-nowrap px-4 py-[9px] text-right font-club-mono text-brand-muted">
                          {linha.partidas}
                        </td>
                        <td className="whitespace-nowrap px-4 py-[9px] text-right font-club-mono text-brand-muted">
                          {linha.vitorias}–{linha.empates}–{linha.derrotas}
                        </td>
                        <td className="whitespace-nowrap px-4 py-[9px] text-right font-club-mono text-brand-muted">
                          {aprov}%
                        </td>
                        <td className="whitespace-nowrap px-4 py-[9px] font-club-mono text-[11px] text-brand-muted">
                          {seq.length > 0 ? seq.join(" ") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* REGISTRAR PARTIDA */}
        <div className="border border-brand-border bg-brand-surface">
          <div className="border-b border-brand-border px-4 py-[13px]">
            <h2 className="font-display text-base font-semibold text-brand-ink">
              Registrar partida
            </h2>
          </div>

          <RegistrarPartidaForm
            associados={associados ?? []}
            quadras={quadras ?? []}
            rankingPorModalidade={rankingPorModalidade}
            redirectTo={redirectTo}
          />
        </div>
      </div>

      {/* ÚLTIMAS PARTIDAS */}
      <div className="border border-brand-border bg-brand-surface">
        <div className="border-b border-brand-border px-4 py-[13px]">
          <h2 className="font-display text-base font-semibold text-brand-ink">
            Últimas partidas
          </h2>
        </div>

        {historicoError && (
          <p className="p-4 text-sm text-[#9c2230]">
            Não foi possível carregar o histórico de partidas.
          </p>
        )}

        {!historicoError && ultimasPartidas.length === 0 && (
          <p className="p-4 text-sm text-brand-muted">
            Nenhuma partida registrada ainda.
          </p>
        )}

        {!historicoError && ultimasPartidas.length > 0 && (
          <ul className="divide-y divide-brand-border-soft">
            {ultimasPartidas.map((p) => {
              const nome1 = nomesPorId.get(p.jogador1_id) ?? "—";
              const nome2 = nomesPorId.get(p.jogador2_id) ?? "—";
              const vencedor =
                p.placar1 === p.placar2
                  ? null
                  : p.placar1 > p.placar2
                    ? nome1
                    : nome2;
              const perdedor =
                p.placar1 === p.placar2
                  ? null
                  : p.placar1 > p.placar2
                    ? nome2
                    : nome1;
              const placarVencedor = Math.max(p.placar1, p.placar2);
              const placarPerdedor = Math.min(p.placar1, p.placar2);

              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-[9px] text-[13px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-club-mono text-[11px] text-brand-muted">
                      {formatDateBR(p.data)}
                    </span>
                    <span className="text-brand-ink">
                      {vencedor ? (
                        <>
                          <strong className="font-semibold">
                            {vencedor}
                          </strong>{" "}
                          d.{" "}
                          <span className="text-brand-muted">
                            {perdedor}
                          </span>
                        </>
                      ) : (
                        <>
                          {nome1} <span className="text-brand-muted">x</span>{" "}
                          {nome2}
                        </>
                      )}
                    </span>
                    {p.quadra_id !== null && (
                      <span className="text-[11px] text-brand-muted">
                        {quadrasPorId.get(p.quadra_id) ?? "—"}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap font-club-mono text-[13px] text-brand-ink">
                    {vencedor
                      ? `${placarVencedor}–${placarPerdedor}`
                      : `${p.placar1}–${p.placar2}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
