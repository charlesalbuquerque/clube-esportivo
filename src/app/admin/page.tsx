import { LogoutButton } from "@/components/LogoutButton";
import { AssociadosCard } from "./AssociadosCard";
import { MensalidadesCard } from "./MensalidadesCard";
import { QuadrasReservasCard } from "./QuadrasReservasCard";
import { RankingCard } from "./RankingCard";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          Painel Administrativo
        </h1>
        <LogoutButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AssociadosCard />
        <MensalidadesCard />
        <QuadrasReservasCard />
        <RankingCard />
      </div>
    </div>
  );
}
