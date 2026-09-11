import { logout } from "@/app/actions/auth";

/** Botão de logout. Server Action — pode ser usado em qualquer página/layout. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
      >
        Sair
      </button>
    </form>
  );
}
