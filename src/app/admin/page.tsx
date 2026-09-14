import { AssociadosCard } from "./AssociadosCard";
import { MensalidadesCard } from "./MensalidadesCard";
import { QuadrasReservasCard } from "./QuadrasReservasCard";
import { RankingCard } from "./RankingCard";
import { PartidasCard } from "./PartidasCard";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-[18px] px-6 pt-5 pb-10">
      <h1 className="font-display text-2xl font-semibold text-brand-ink">
        Painel Administrativo
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <AssociadosCard />
        <MensalidadesCard />
        <QuadrasReservasCard />
        <RankingCard />
        <PartidasCard />
      </div>
    </div>
  );
}
