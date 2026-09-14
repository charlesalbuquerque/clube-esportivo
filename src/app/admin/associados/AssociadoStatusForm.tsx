import { updateAssociadoStatus } from "@/app/actions/associados";

export function AssociadoStatusForm({
  id,
  status,
  redirectTo,
}: {
  id: string;
  status: string;
  redirectTo: string;
}) {
  const action = updateAssociadoStatus.bind(null, id, redirectTo);

  return (
    <form action={action} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={status}
        className="rounded border border-line px-2 py-1 text-xs bg-surface text-ink"
      >
        <option value="ativo">ativo</option>
        <option value="inativo">inativo</option>
      </select>
      <button
        type="submit"
        className="rounded border border-line px-2 py-1 text-xs text-ink-soft hover:bg-surface-hover"
      >
        Salvar
      </button>
    </form>
  );
}
