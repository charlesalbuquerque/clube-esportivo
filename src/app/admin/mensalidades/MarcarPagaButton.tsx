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
        className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
      >
        Marcar como paga
      </button>
    </form>
  );
}
