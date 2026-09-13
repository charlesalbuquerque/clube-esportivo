import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AssociadoPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">
            Olá, {profile?.full_name}
          </h1>

          <LogoutButton />
        </div>

        <p className="text-sm text-zinc-600">
          Área do associado. Acesse os módulos disponíveis abaixo.
        </p>

        <div className="mt-5 grid gap-3">
          <Link
            href="/associado/reservas"
            className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50"
          >
            <h2 className="text-sm font-semibold text-zinc-900">
              Reservas
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Consulte a disponibilidade e reserve uma quadra.
            </p>
          </Link>

          <div className="flex gap-4">
            <Link
              href="/associado/perfil"
              className="text-sm text-zinc-600 underline"
            >
              Meu perfil
            </Link>

            <Link
              href="/associado/mensalidades"
              className="text-sm text-zinc-600 underline"
            >
              Minhas mensalidades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}