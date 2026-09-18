import Link from "next/link";
import { AssociadoCard } from "./AssociadoCard";

export function ReservarQuadraCard() {
  return (
    <AssociadoCard title="Reservar quadra">
      <p className="text-sm text-brand-muted">
        Escolha uma quadra, uma data e um horário disponível para realizar
        sua reserva.
      </p>

      <Link
        href="/associado/reservas"
        className="mt-4 inline-block bg-brand-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-800"
      >
        Reservar quadra
      </Link>
    </AssociadoCard>
  );
}
