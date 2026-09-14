import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NovaQuadraForm } from "./NovaQuadraForm";
import { NovoHorarioForm } from "./NovoHorarioForm";
import { deleteHorario } from "@/app/actions/quadras";

const DIAS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default async function QuadrasPage() {
  "use server";

  const supabase = await createClient();

  const redirectTo = "/admin/quadras";

  // Função intermediária para o formulário de exclusão.
  // Ela não retorna nenhum valor, como o <form action> espera.
  const excluirHorario = async (formData: FormData) => {
    "use server";
    
    const id = Number(formData.get("id"));

    if (!id) {
      return;
    }

    await deleteHorario(id, redirectTo);
  };

  const [
    { data: quadras, error: quadrasError },
    { data: horarios, error: horariosError },
  ] = await Promise.all([
    supabase
      .from("quadras")
      .select("id, nome, tipo, descricao")
      .order("nome"),

    supabase
      .from("quadra_horarios")
      .select(
        "id, quadra_id, dia_semana, hora_inicio, hora_fim, ativo"
      )
      .order("quadra_id")
      .order("dia_semana")
      .order("hora_inicio"),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* CABEÇALHO */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Quadras e disponibilidade
          </h1>

          <p className="mt-1 text-sm text-ink-muted">
            Cadastre as quadras do clube e defina os horários
            disponíveis para reservas.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded border border-line px-3 py-2 text-sm text-ink-soft hover:bg-surface-alt"
        >
          Voltar
        </Link>
      </div>

      {/* CADASTRO DE QUADRA */}
      <section className="mb-6">
        <NovaQuadraForm redirectTo={redirectTo} />
      </section>

      {/* ERRO AO CARREGAR DADOS */}
      {(quadrasError || horariosError) && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Não foi possível carregar as quadras ou os horários.
          </p>

          <p className="mt-1 text-xs text-red-600">
            Confirme se a tabela{" "}
            <strong>quadra_horarios</strong> existe no Supabase.
          </p>
        </div>
      )}

      {/* LISTA DE QUADRAS */}
      <div className="space-y-6">
        {(quadras ?? []).map((quadra) => {
          const horariosDaQuadra = (horarios ?? []).filter(
            (horario) => horario.quadra_id === quadra.id
          );

          return (
            <section
              key={quadra.id}
              className="rounded-lg border border-line-subtle bg-surface p-5 shadow-sm"
            >
              {/* INFORMAÇÕES DA QUADRA */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {quadra.nome}
                  </h2>

                  <p className="mt-1 text-sm text-ink-muted">
                    Tipo: {quadra.tipo}
                  </p>

                  {quadra.descricao && (
                    <p className="mt-2 text-sm text-ink-muted">
                      {quadra.descricao}
                    </p>
                  )}
                </div>

                <span className="rounded-full bg-surface-hover px-3 py-1 text-xs text-ink-muted">
                  {horariosDaQuadra.length}{" "}
                  {horariosDaQuadra.length === 1
                    ? "horário"
                    : "horários"}
                </span>
              </div>

              {/* HORÁRIOS */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  Horários disponíveis
                </h3>

                {horariosDaQuadra.length === 0 ? (
                  <p className="rounded border border-dashed border-line p-4 text-sm text-ink-muted">
                    Nenhum horário foi cadastrado para esta
                    quadra.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded border border-line-subtle">
                    {horariosDaQuadra.map((horario) => (
                      <div
                        key={horario.id}
                        className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-3 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {DIAS[horario.dia_semana]}
                          </p>

                          <p className="text-xs text-ink-muted">
                            {String(
                              horario.hora_inicio
                            ).slice(0, 5)}
                            {" – "}
                            {String(
                              horario.hora_fim
                            ).slice(0, 5)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              horario.ativo
                                ? "bg-green-100 text-green-700"
                                : "bg-surface-hover text-ink-muted"
                            }`}
                          >
                            {horario.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>

                          {/* EXCLUIR HORÁRIO */}
                          <form action={excluirHorario}>
                            <input
                              type="hidden"
                              name="id"
                              value={horario.id}
                            />

                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline"
                            >
                              Excluir
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ADICIONAR HORÁRIO */}
              <div className="mt-5 border-t border-line-subtle pt-5">
                <NovoHorarioForm
                  quadraId={quadra.id}
                  redirectTo={redirectTo}
                />
              </div>
            </section>
          );
        })}
      </div>

      {/* NENHUMA QUADRA */}
      {(quadras ?? []).length === 0 && !quadrasError && (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <p className="text-sm text-ink-muted">
            Nenhuma quadra cadastrada ainda.
          </p>

          <p className="mt-1 text-xs text-ink-muted">
            Use o formulário acima para cadastrar a primeira
            quadra.
          </p>
        </div>
      )}

      {/* LINK PARA RESERVAS */}
      <div className="mt-8 flex justify-end">
        <Link
          href="/associado/reservas"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Abrir agenda de reservas
        </Link>
      </div>
    </main>
  );
}