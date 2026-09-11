import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { formatDateBR } from "@/lib/format";
import { PerfilForm } from "./PerfilForm";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/associado" className="text-sm text-zinc-600 underline">
        ← Voltar
      </Link>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">
          Meu perfil
        </h1>

        <dl className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Status</dt>
            <dd className="text-zinc-900">{profile.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Associado desde</dt>
            <dd className="text-zinc-900">
              {formatDateBR(profile.joined_at)}
            </dd>
          </div>
        </dl>

        <PerfilForm fullName={profile.full_name} phone={profile.phone ?? ""} />
      </div>
    </div>
  );
}
