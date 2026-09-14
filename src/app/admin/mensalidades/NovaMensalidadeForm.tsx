import { createMensalidade } from "@/app/actions/mensalidades";

export function NovaMensalidadeForm({
  associados,
  redirectTo,
}: {
  associados: { id: string; full_name: string }[];
  redirectTo: string;
}) {
  const action = createMensalidade.bind(null, redirectTo);

  return (
    <form
      action={action}
      className="mb-6 flex flex-wrap items-end gap-2 rounded border border-line-subtle bg-surface p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="associado_id" className="text-xs text-ink-muted">
          Associado
        </label>
        <select
          id="associado_id"
          name="associado_id"
          required
          className="rounded border border-line px-2 py-1.5 text-sm bg-surface text-ink"
        >
          <option value="">Selecione...</option>
          {associados.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="mes" className="text-xs text-ink-muted">
          Mês de referência
        </label>
        <input
          id="mes"
          name="mes"
          type="month"
          required
          className="rounded border border-line px-2 py-1.5 text-sm bg-surface text-ink"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="valor" className="text-xs text-ink-muted">
          Valor
        </label>
        <input
          id="valor"
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-28 rounded border border-line px-2 py-1.5 text-sm bg-surface text-ink"
        />
      </div>

      <button
        type="submit"
        className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Lançar
      </button>
    </form>
  );
}
