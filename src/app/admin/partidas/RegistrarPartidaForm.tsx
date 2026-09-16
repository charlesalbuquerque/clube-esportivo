"use client";

import { useMemo, useState } from "react";
import { createPartida } from "@/app/actions/partidas";
import { MODALIDADES, type Modalidade } from "./modalidades";
import EquipeSelector from "./EquipeSelector";

type Associado = {
  id: string;
  full_name: string;
};

type Quadra = {
  id: number;
  nome: string;
};

type RankingLinha = {
  associado_id: string;
  nome: string;
  partidas: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
};

type SetInput = { a: string; b: string };

const NUMERO_DE_SETS = 3;

function setsVencidos(sets: SetInput[]) {
  let a = 0;
  let b = 0;

  for (const set of sets) {
    if (set.a === "" || set.b === "") continue;

    const na = Number(set.a);
    const nb = Number(set.b);

    if (!Number.isInteger(na) || !Number.isInteger(nb)) continue;

    if (na > nb) a += 1;
    else if (nb > na) b += 1;
  }

  return { a, b };
}

function formatPosicao(antes: number | null, depois: number) {
  if (antes === null) return `estreia em ${depois}º`;
  if (antes === depois) return `${antes}º, mantém`;
  return `${antes}º → ${depois}º`;
}

export default function RegistrarPartidaForm({
  associados,
  quadras,
  rankingPorModalidade,
  redirectTo,
}: {
  associados: Associado[];
  quadras: Quadra[];
  rankingPorModalidade: Record<Modalidade, RankingLinha[]>;
  redirectTo: string;
}) {
  const [tipo, setTipo] = useState<"individual" | "equipe">("individual");
  const [modalidade, setModalidade] = useState<Modalidade>("tenis_simples");
  const [jogador1Id, setJogador1Id] = useState("");
  const [jogador2Id, setJogador2Id] = useState("");
  const [sets, setSets] = useState<SetInput[]>(
    Array.from({ length: NUMERO_DE_SETS }, () => ({ a: "", b: "" }))
  );

  function atualizarSet(indice: number, lado: "a" | "b", valor: string) {
    setSets((atual) =>
      atual.map((set, i) => (i === indice ? { ...set, [lado]: valor } : set))
    );
  }

  const { a: placar1, b: placar2 } = setsVencidos(sets);

  const setsPreenchidos = sets
    .filter((set) => set.a !== "" && set.b !== "")
    .map((set) => ({ a: Number(set.a), b: Number(set.b) }));

  const previa = useMemo(() => {
    if (tipo !== "individual" || !jogador1Id || !jogador2Id) return null;
    if (jogador1Id === jogador2Id) return null;
    if (placar1 === 0 && placar2 === 0) return null;

    const rankingAtual = rankingPorModalidade[modalidade] ?? [];

    const nomeDe = (id: string) =>
      rankingAtual.find((r) => r.associado_id === id)?.nome ??
      associados.find((a) => a.id === id)?.full_name ??
      "—";

    const pontosAtuaisDe = (id: string) =>
      rankingAtual.find((r) => r.associado_id === id)?.pontos ?? 0;

    const posicaoAntesDe = (id: string) => {
      const i = rankingAtual.findIndex((r) => r.associado_id === id);
      return i === -1 ? null : i + 1;
    };

    const delta1 = placar1 > placar2 ? 3 : placar1 === placar2 ? 1 : 0;
    const delta2 = placar2 > placar1 ? 3 : placar1 === placar2 ? 1 : 0;

    const pontos1Novo = pontosAtuaisDe(jogador1Id) + delta1;
    const pontos2Novo = pontosAtuaisDe(jogador2Id) + delta2;

    // Simulação pra prévia — não precisa reproduzir o desempate exato de
    // get_ranking() (vitórias, depois nome), só dar uma posição aproximada.
    const simulado = rankingAtual
      .filter(
        (r) => r.associado_id !== jogador1Id && r.associado_id !== jogador2Id
      )
      .map((r) => ({ associado_id: r.associado_id, pontos: r.pontos }))
      .concat([
        { associado_id: jogador1Id, pontos: pontos1Novo },
        { associado_id: jogador2Id, pontos: pontos2Novo },
      ])
      .sort((x, y) => y.pontos - x.pontos);

    const posicaoDepoisDe = (id: string) =>
      simulado.findIndex((r) => r.associado_id === id) + 1;

    return {
      texto1: `${nomeDe(jogador1Id)} ${pontosAtuaisDe(jogador1Id)} → ${pontos1Novo} pts (${formatPosicao(
        posicaoAntesDe(jogador1Id),
        posicaoDepoisDe(jogador1Id)
      )})`,
      texto2: `${nomeDe(jogador2Id)} ${pontosAtuaisDe(jogador2Id)} → ${pontos2Novo} pts (${formatPosicao(
        posicaoAntesDe(jogador2Id),
        posicaoDepoisDe(jogador2Id)
      )})`,
    };
  }, [tipo, jogador1Id, jogador2Id, placar1, placar2, modalidade, rankingPorModalidade, associados]);

  async function handleSubmit(formData: FormData) {
    await createPartida(redirectTo, formData);

    // O <form action> do React reseta os campos nativamente no DOM depois
    // de uma Server Action bem-sucedida, mas isso não sincroniza com o
    // estado controlado daqui (o <select> fica visualmente em branco só na
    // tela, com o estado antigo ainda "vivo" por trás — a prévia ficava
    // mostrando o jogador anterior). Resetando explicitamente em vez de
    // depender desse reset nativo.
    // Reseta tudo (não só jogadores/placar) — um <select> cujo estado não
    // muda não reflete de volta no DOM (o React só reescreve o valor
    // quando o estado realmente muda), então resetar tipo/modalidade
    // também aqui evita a mesma tela-diz-uma-coisa-estado-diz-outra.
    // Isso também desmonta o EquipeSelector (tipo volta a "individual"),
    // o que limpa as equipes selecionadas nele.
    setTipo("individual");
    setModalidade("tenis_simples");
    setJogador1Id("");
    setJogador2Id("");
    setSets(Array.from({ length: NUMERO_DE_SETS }, () => ({ a: "", b: "" })));
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 p-4">
      <input type="hidden" name="sets" value={JSON.stringify(setsPreenchidos)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="tipo"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
          >
            Tipo de partida
          </label>
          <select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "individual" | "equipe")}
            className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
          >
            <option value="individual">Individual</option>
            <option value="equipe">Em equipe</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="modalidade"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
          >
            Modalidade
          </label>
          <select
            id="modalidade"
            name="modalidade"
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value as Modalidade)}
            className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
          >
            {MODALIDADES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="data"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
          >
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
          />
        </div>

        <div>
          <label
            htmlFor="quadra_id"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
          >
            Quadra
          </label>
          <select
            id="quadra_id"
            name="quadra_id"
            className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
          >
            <option value="">Nenhuma quadra</option>
            {quadras.map((quadra) => (
              <option key={quadra.id} value={quadra.id}>
                {quadra.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tipo === "individual" ? (
        <div className="border border-brand-border-soft bg-brand-surface-head p-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label
                htmlFor="jogador1_id"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
              >
                Jogador A
              </label>
              <select
                id="jogador1_id"
                name="jogador1_id"
                value={jogador1Id}
                onChange={(e) => setJogador1Id(e.target.value)}
                className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
              >
                <option value="">Selecione</option>
                {associados.map((associado) => (
                  <option key={associado.id} value={associado.id}>
                    {associado.full_name}
                  </option>
                ))}
              </select>
            </div>

            <span className="pb-2 text-[11px] uppercase text-brand-muted">
              vs.
            </span>

            <div>
              <label
                htmlFor="jogador2_id"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted"
              >
                Jogador B
              </label>
              <select
                id="jogador2_id"
                name="jogador2_id"
                value={jogador2Id}
                onChange={(e) => setJogador2Id(e.target.value)}
                className="w-full border border-brand-input-border bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-green-700"
              >
                <option value="">Selecione</option>
                {associados.map((associado) => (
                  <option key={associado.id} value={associado.id}>
                    {associado.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <EquipeSelector associados={associados} />
      )}

      <div className="border border-brand-border-soft bg-brand-surface-head p-3">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
          Placar por set
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {sets.map((set, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={`Set ${i + 1} — lado A`}
                value={set.a}
                onChange={(e) => atualizarSet(i, "a", e.target.value)}
                className="w-full border border-brand-input-border bg-brand-surface px-2 py-2 text-center font-club-mono text-sm text-brand-ink outline-none focus:border-brand-green-700"
              />
              <span className="text-brand-muted">–</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label={`Set ${i + 1} — lado B`}
                value={set.b}
                onChange={(e) => atualizarSet(i, "b", e.target.value)}
                className="w-full border border-brand-input-border bg-brand-surface px-2 py-2 text-center font-club-mono text-sm text-brand-ink outline-none focus:border-brand-green-700"
              />
            </div>
          ))}
        </div>

        <p className="mt-2 text-[11px] text-brand-muted">
          Preencha pelo menos o set 1. Sets vazios são ignorados.
        </p>
      </div>

      <p className="font-club-mono text-[11px] leading-relaxed text-brand-muted">
        {previa
          ? `Prévia — ${previa.texto1} · ${previa.texto2}`
          : "Prévia — vitória +3 pts · empate +1 · derrota +0"}
      </p>

      <button
        type="submit"
        disabled={placar1 === 0 && placar2 === 0}
        className="bg-brand-green-700 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-brand-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Salvar resultado
      </button>
    </form>
  );
}
