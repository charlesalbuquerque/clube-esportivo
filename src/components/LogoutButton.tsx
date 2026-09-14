import { logout } from "@/app/actions/auth";

/** Botão de logout. Server Action — pode ser usado em qualquer página/layout. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface-hover"
      >
        Sair
      </button>
    </form>
  );
}
