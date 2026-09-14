"use client";

import { useState } from "react";

type Associado = {
  id: string;
  full_name: string;
};

type Participante = {
  associado_id: string;
  lado: "lado_a" | "lado_b";
};

export default function EquipePartidaForm({
  associados,
}: {
  associados: Associado[];
}) {
  const [ladoA, setLadoA] = useState<string[]>([]);
  const [ladoB, setLadoB] = useState<string[]>([]);

  const participantes: Participante[] = [
    ...ladoA.map((id) => ({
      associado_id: id,
      lado: "lado_a" as const,
    })),
    ...ladoB.map((id) => ({
      associado_id: id,
      lado: "lado_b" as const,
    })),
  ];

  function toggleParticipante(
    id: string,
    lado: "lado_a" | "lado_b"
  ) {
    if (lado === "lado_a") {
      setLadoA((atual) =>
        atual.includes(id)
          ? atual.filter((item) => item !== id)
          : [...atual, id]
      );

      setLadoB((atual) =>
        atual.filter((item) => item !== id)
      );
    } else {
      setLadoB((atual) =>
        atual.includes(id)
          ? atual.filter((item) => item !== id)
          : [...atual, id]
      );

      setLadoA((atual) =>
        atual.filter((item) => item !== id)
      );
    }
  }

  return (
    <div className="rounded-xl border border-line-subtle bg-surface-alt p-4">
      <h2 className="mb-1 text-sm font-semibold text-ink">
        Partida em equipe
      </h2>

      <p className="mb-4 text-xs text-ink-muted">
        Selecione os associados que fazem parte de cada equipe.
      </p>

      <input
        type="hidden"
        name="participantes"
        value={JSON.stringify(participantes)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* EQUIPE A */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-ink-soft">
            Equipe A
          </h3>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoA.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-line-subtle bg-surface px-3 py-2 text-sm hover:bg-surface-alt"
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() =>
                      toggleParticipante(
                        associado.id,
                        "lado_a"
                      )
                    }
                  />

                  <span>{associado.full_name}</span>
                </label>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-ink-muted">
            {ladoA.length} participante(s)
          </p>
        </div>

        {/* EQUIPE B */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-ink-soft">
            Equipe B
          </h3>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoB.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-line-subtle bg-surface px-3 py-2 text-sm hover:bg-surface-alt"
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() =>
                      toggleParticipante(
                        associado.id,
                        "lado_b"
                      )
                    }
                  />

                  <span>{associado.full_name}</span>
                </label>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-ink-muted">
            {ladoB.length} participante(s)
          </p>
        </div>
      </div>
    </div>
  );
}