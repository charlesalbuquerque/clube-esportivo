import { createHorario } from "@/app/actions/quadras";

export function NovoHorarioForm({
  quadraId,
  redirectTo,
}: {
  quadraId: number;
  redirectTo: string;
}) {
  const action = async (formData: FormData) => {
    "use server";

  await createHorario(quadraId, redirectTo, formData);
};

  return (
    <form
      action={action}
      className="rounded border border-line-subtle bg-surface p-4"
    >
      <h3 className="mb-4 text-sm font-semibold text-ink">
        Adicionar horário disponível
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`dia_semana_${quadraId}`}
            className="text-xs text-ink-muted"
          >
            Dia da semana
          </label>

          <select
            id={`dia_semana_${quadraId}`}
            name="dia_semana"
            required
            defaultValue=""
            className="rounded border border-line px-3 py-2 text-sm bg-surface text-ink"
          >
            <option value="" disabled>
              Selecione...
            </option>

            <option value="0">Domingo</option>
            <option value="1">Segunda-feira</option>
            <option value="2">Terça-feira</option>
            <option value="3">Quarta-feira</option>
            <option value="4">Quinta-feira</option>
            <option value="5">Sexta-feira</option>
            <option value="6">Sábado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`hora_inicio_${quadraId}`}
            className="text-xs text-ink-muted"
          >
            Horário inicial
          </label>

          <input
            id={`hora_inicio_${quadraId}`}
            name="hora_inicio"
            type="time"
            required
            className="rounded border border-line px-3 py-2 text-sm bg-surface text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`hora_fim_${quadraId}`}
            className="text-xs text-ink-muted"
          >
            Horário final
          </label>

          <input
            id={`hora_fim_${quadraId}`}
            name="hora_fim"
            type="time"
            required
            className="rounded border border-line px-3 py-2 text-sm bg-surface text-ink"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Adicionar horário
      </button>
    </form>
  );
}