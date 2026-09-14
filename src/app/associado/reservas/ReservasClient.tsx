"use client";

import { useEffect, useMemo, useState } from "react";

type Quadra = {
  id: number;
  nome: string;
  tipo: string;
  descricao: string | null;
};

type Horario = {
  id: number;
  quadra_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
};

type Reserva = {
  id: number;
  quadra_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: "confirmada" | "cancelada";
};

type Props = {
  quadras: Quadra[];
};

const DIAS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function ReservasClient({ quadras }: Props) {
  const [quadraId, setQuadraId] = useState<number>(
    quadras[0]?.id ?? 0
  );

  const [data, setData] = useState("");

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const quadraSelecionada = useMemo(
    () => quadras.find((quadra) => quadra.id === quadraId),
    [quadras, quadraId]
  );

  /*
   * Descobre o dia da semana da data selecionada.
   *
   * O JavaScript usa:
   * 0 = domingo
   * 1 = segunda
   * ...
   * 6 = sábado
   */
  const diaSemana = useMemo(() => {
    if (!data) {
      return null;
    }

    const [ano, mes, dia] = data.split("-").map(Number);

    const dataLocal = new Date(ano, mes - 1, dia);

    return dataLocal.getDay();
  }, [data]);

  /*
   * Carrega os horários disponíveis e as reservas
   * quando o usuário escolhe uma quadra e uma data.
   */
  useEffect(() => {
    async function carregarDados() {
      if (!quadraId || !data || diaSemana === null) {
        setHorarios([]);
        setReservas([]);
        return;
      }

      setCarregando(true);
      setErro("");
      setMensagem("");

      try {
        const resposta = await fetch(
          `/api/reservas/disponibilidade?quadra_id=${quadraId}&data=${data}`
        );

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível carregar a disponibilidade."
          );
        }

        const resultado = await resposta.json();

        setHorarios(resultado.horarios ?? []);
        setReservas(resultado.reservas ?? []);
      } catch (error) {
        console.error(error);

        setHorarios([]);
        setReservas([]);

        setErro(
          "Não foi possível carregar os horários disponíveis."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [quadraId, data, diaSemana]);

  const horariosDoDia = horarios.filter(
    (horario) =>
      horario.quadra_id === quadraId &&
      horario.dia_semana === diaSemana &&
      horario.ativo
  );

  function horarioReservado(horario: Horario) {
    return reservas.some(
      (reserva) =>
        reserva.status === "confirmada" &&
        reserva.hora_inicio === horario.hora_inicio &&
        reserva.hora_fim === horario.hora_fim
    );
  }

  async function reservar(horario: Horario) {
    setErro("");
    setMensagem("");

    if (!data) {
      setErro("Selecione uma data antes de reservar.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quadra_id: quadraId,
          data,
          hora_inicio: horario.hora_inicio,
          hora_fim: horario.hora_fim,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ??
            "Não foi possível realizar a reserva."
        );
        return;
      }

      setMensagem("Reserva realizada com sucesso!");

      /*
       * Atualiza a lista de reservas para que o horário
       * fique imediatamente indisponível.
       */
      setReservas((anteriores) => [
        ...anteriores,
        resultado.reserva,
      ]);
    } catch (error) {
      console.error(error);

      setErro(
        "Ocorreu um erro ao tentar realizar a reserva."
      );
    } finally {
      setCarregando(false);
    }
  }

  /*
   * Data mínima = hoje.
   * Assim o associado não consegue escolher uma data passada.
   */
  const hoje = new Date();

  const anoHoje = hoje.getFullYear();
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
  const diaHoje = String(hoje.getDate()).padStart(2, "0");

  const dataMinima = `${anoHoje}-${mesHoje}-${diaHoje}`;

  return (
    <div className="space-y-6">
      {/* SELEÇÃO */}
      <section className="rounded-lg border border-line-subtle bg-surface p-5 shadow-sm">
        <h2 className="text-base font-semibold text-ink">
          Escolha a quadra
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* QUADRA */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quadra"
              className="text-sm text-ink-muted"
            >
              Quadra
            </label>

            <select
              id="quadra"
              value={quadraId}
              onChange={(event) =>
                setQuadraId(Number(event.target.value))
              }
              className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            >
              {quadras.map((quadra) => (
                <option
                  key={quadra.id}
                  value={quadra.id}
                >
                  {quadra.nome} — {quadra.tipo}
                </option>
              ))}
            </select>
          </div>

          {/* DATA */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="data"
              className="text-sm text-ink-muted"
            >
              Data
            </label>

            <input
              id="data"
              type="date"
              value={data}
              min={dataMinima}
              onChange={(event) => {
                setData(event.target.value);
                setMensagem("");
                setErro("");
              }}
              className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            />
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES DA QUADRA */}
      {quadraSelecionada && (
        <section className="rounded-lg border border-line-subtle bg-surface p-5">
          <h2 className="text-lg font-semibold text-ink">
            {quadraSelecionada.nome}
          </h2>

          <p className="mt-1 text-sm text-ink-muted">
            {quadraSelecionada.tipo}
          </p>

          {quadraSelecionada.descricao && (
            <p className="mt-2 text-sm text-ink-muted">
              {quadraSelecionada.descricao}
            </p>
          )}
        </section>
      )}

      {/* MENSAGENS */}
      {mensagem && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">
            {mensagem}
          </p>
        </div>
      )}

      {erro && (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {erro}
          </p>
        </div>
      )}

      {/* HORÁRIOS */}
      <section className="rounded-lg border border-line-subtle bg-surface p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-ink">
            Horários disponíveis
          </h2>

          {!data && (
            <p className="mt-1 text-sm text-ink-muted">
              Selecione uma data para visualizar os horários.
            </p>
          )}

          {data && diaSemana !== null && (
            <p className="mt-1 text-sm text-ink-muted">
              {DIAS[diaSemana]} —{" "}
              {data.split("-").reverse().join("/")}
            </p>
          )}
        </div>

        {carregando ? (
          <p className="text-sm text-ink-muted">
            Carregando horários...
          </p>
        ) : data && horariosDoDia.length === 0 ? (
          <div className="rounded border border-dashed border-line p-6 text-center">
            <p className="text-sm text-ink-muted">
              Nenhum horário disponível para esta data.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {horariosDoDia.map((horario) => {
              const reservado = horarioReservado(horario);

              return (
                <div
                  key={horario.id}
                  className={`rounded-lg border p-4 ${
                    reservado
                      ? "border-line-subtle bg-surface-alt"
                      : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {String(
                          horario.hora_inicio
                        ).slice(0, 5)}
                        {" – "}
                        {String(
                          horario.hora_fim
                        ).slice(0, 5)}
                      </p>

                      <p className="mt-1 text-xs text-ink-muted">
                        {reservado
                          ? "Horário reservado"
                          : "Disponível"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={reservado || carregando}
                      onClick={() => reservar(horario)}
                      className={`rounded px-3 py-2 text-xs font-medium ${
                        reservado
                          ? "cursor-not-allowed bg-surface-hover text-ink-muted"
                          : "bg-accent text-white hover:bg-accent-hover"
                      }`}
                    >
                      {reservado
                        ? "Indisponível"
                        : "Reservar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}