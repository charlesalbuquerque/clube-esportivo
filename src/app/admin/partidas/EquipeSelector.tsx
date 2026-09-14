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
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <h2 className="mb-1 text-sm font-semibold text-zinc-900">
        Participantes das equipes
      </h2>

      <p className="mb-5 text-xs text-zinc-500">
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
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">
            Equipe A
          </h3>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoA.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    selecionado
                      ? "border-zinc-900 bg-zinc-100"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <input
                    type="checkbox"
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

          <p className="mt-3 text-xs text-zinc-500">
            {ladoA.length} participante(s)
          </p>
        </div>

        {/* EQUIPE B */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">
            Equipe B
          </h3>

          <div className="space-y-2">
            {associados.map((associado) => {
              const selecionado = ladoB.includes(associado.id);

              return (
                <label
                  key={associado.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    selecionado
                      ? "border-zinc-900 bg-zinc-100"
                      : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <input
                    type="checkbox"
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

          <p className="mt-3 text-xs text-zinc-500">
            {ladoB.length} participante(s)
          </p>
        </div>
      </div>
    </div>
  );
}
