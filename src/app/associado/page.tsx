import { getCurrentProfile } from "@/lib/auth";

export default async function AssociadoPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col gap-[18px] px-6 pt-5 pb-10">
      <h1 className="font-display text-2xl font-semibold text-brand-ink">
        Olá, {profile?.full_name}
      </h1>

      <p className="text-sm text-brand-muted">
        Área do associado. Use o menu ao lado para reservar quadra, ver suas
        mensalidades ou editar seu perfil.
      </p>
    </div>
  );
}