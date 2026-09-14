import { marcarComoPaga } from "@/app/actions/mensalidades";

export function MarcarPagaButton({
  id,
  redirectTo,
}: {
  id: number;
  redirectTo: string;
}) {
  const action = marcarComoPaga.bind(null, id, redirectTo);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded border border-line px-2 py-1 text-xs text-ink-soft hover:bg-surface-hover"
      >
        Marcar como paga
      </button>
    </form>
  );
}
