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

export default function EquipeSelector({
  associados,
}: {
  associados: Associado[];
}) {
  const [ladoA, setLadoA] = useState<string[]>([]);
  const [ladoB, setLadoB] = useState<string[]>([]);

  function adicionarParticipante(
    id: string,
    lado: "lado_a" | "lado_b"
  ) {
    if (lado === "lado_a") {
      setLadoB((atual) => atual.filter((item) => item !== id));

      setLadoA((atual) =>
        atual.includes(id)
          ? atual.filter((item) => item !== id)
          : [...atual, id]
      );
    } else {
      setLadoA((atual) => atual.filter((item) => item !== id));

      setLadoB((atual) =>
        atual.includes(id)
          ? atual.filter((item) => item !== id)
          : [...atual, id]
      );
    }
  }

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

  return (
    <div className="border border-brand-border-soft bg-brand-surface-head p-3">
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
        Participantes das equipes
      </h3>

      <p className="mb-4 text-xs text-brand-muted">
        Selecione cada associado e escolha em qual equipe ele irá jogar.
      </p>

      {/* Este campo é enviado para a Server Action */}
      <input
        type="hidden"
        name="participantes"
        value={JSON.stringify(participantes)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* EQUIPE A */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
            Equipe A
          </h4>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoA.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className={`flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm ${
                    selecionado
                      ? "border-brand-green-700 bg-white"
                      : "border-brand-input-border bg-white hover:bg-brand-surface-head"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-green-700"
                    checked={selecionado}
                    onChange={() =>
                      adicionarParticipante(
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

          <p className="mt-3 text-xs text-brand-muted">
            {ladoA.length} participante(s)
          </p>
        </div>

        {/* EQUIPE B */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
            Equipe B
          </h4>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoB.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className={`flex cursor-pointer items-center gap-3 border px-3 py-2 text-sm ${
                    selecionado
                      ? "border-brand-green-700 bg-white"
                      : "border-brand-input-border bg-white hover:bg-brand-surface-head"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-green-700"
                    checked={selecionado}
                    onChange={() =>
                      adicionarParticipante(
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

          <p className="mt-3 text-xs text-brand-muted">
            {ladoB.length} participante(s)
          </p>
        </div>
      </div>
    </div>
  );
}
