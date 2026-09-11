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
        className="rounded border border-zinc-300 px-2 py-1 text-xs"
      >
        <option value="ativo">ativo</option>
        <option value="inativo">inativo</option>
      </select>
      <button
        type="submit"
        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
      >
        Salvar
      </button>
    </form>
  );
}
