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
          Área do associado. Os módulos de mensalidades, reservas e ranking
          vão aparecer aqui.
        </p>
        <Link
          href="/associado/perfil"
          className="mt-4 inline-block text-sm text-zinc-600 underline"
        >
          Meu perfil
        </Link>
      </div>
    </div>
  );
}
