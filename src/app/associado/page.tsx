import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AssociadoPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col items-center bg-surface-alt px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-line-subtle bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">
            Olá, {profile?.full_name}
          </h1>

          <LogoutButton />
        </div>

        <p className="text-sm text-ink-muted">
          Área do associado. Acesse os módulos disponíveis abaixo.
        </p>

        <div className="mt-5 grid gap-3">
          <Link
            href="/associado/reservas"
            className="rounded-lg border border-line-subtle p-4 transition hover:bg-surface-alt"
          >
            <h2 className="text-sm font-semibold text-ink">
              Reservas
            </h2>

            <p className="mt-1 text-xs text-ink-muted">
              Consulte a disponibilidade e reserve uma quadra.
            </p>
          </Link>

          <div className="flex gap-4">
            <Link
              href="/associado/perfil"
              className="text-sm text-ink-muted underline"
            >
              Meu perfil
            </Link>

            <Link
              href="/associado/mensalidades"
              className="text-sm text-ink-muted underline"
            >
              Minhas mensalidades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}