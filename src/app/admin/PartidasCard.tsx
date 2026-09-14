import Link from "next/link";
import { DashboardCard } from "./DashboardCard";

export function PartidasCard() {
  return (
    <DashboardCard title="Partidas">
      <p className="text-sm text-zinc-600">
        Registre resultados de partidas individuais ou em equipe.
      </p>

      <Link
        href="/admin/partidas"
        className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Registrar partida
      </Link>
    </DashboardCard>
  );
}