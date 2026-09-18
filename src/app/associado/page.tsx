import { SaudacaoMensalidadeCard } from "./SaudacaoMensalidadeCard";
import { RankingPosicaoCard } from "./RankingPosicaoCard";
import { ProximasReservasCard } from "./ProximasReservasCard";
import { UltimasPartidasCard } from "./UltimasPartidasCard";
import { ReservarQuadraCard } from "./ReservarQuadraCard";

export default function AssociadoPage() {
  return (
    <div className="flex flex-col gap-[18px] px-6 pt-5 pb-10">
      <h1 className="font-display text-2xl font-semibold text-brand-ink">
        Área do associado
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <SaudacaoMensalidadeCard />
        <RankingPosicaoCard />
        <ProximasReservasCard />
        <UltimasPartidasCard />
        <ReservarQuadraCard />
      </div>
    </div>
  );
}