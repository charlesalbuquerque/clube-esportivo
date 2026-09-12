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
      className="mb-6 flex flex-wrap items-end gap-2 rounded border border-zinc-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="associado_id" className="text-xs text-zinc-600">
          Associado
        </label>
        <select
          id="associado_id"
          name="associado_id"
          required
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
        <label htmlFor="mes" className="text-xs text-zinc-600">
          Mês de referência
        </label>
        <input
          id="mes"
          name="mes"
          type="month"
          required
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="valor" className="text-xs text-zinc-600">
          Valor
        </label>
        <input
          id="valor"
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-28 rounded border border-zinc-300 px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Lançar
      </button>
    </form>
  );
}
