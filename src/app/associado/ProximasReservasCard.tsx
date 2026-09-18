import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { formatDateBR } from "@/lib/format";
import { AssociadoCard } from "./AssociadoCard";

type Reserva = {
  id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  quadras: { nome: string } | { nome: string }[] | null;
};

function nomeQuadra(reserva: Reserva): string {
  const quadra = Array.isArray(reserva.quadras)
    ? reserva.quadras[0]
    : reserva.quadras;
  return quadra?.nome ?? "—";
}

export async function ProximasReservasCard() {
  const profile = await getCurrentProfile();

  let reservas: Reserva[] = [];
  let erro = false;

  try {
    if (!profile) throw new Error("Sem perfil.");

    const supabase = await createClient();

    const now = new Date();
    const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("reservas")
      .select("id, data, hora_inicio, hora_fim, quadras(nome)")
      .eq("associado_id", profile.id)
      .eq("status", "confirmada")
      .gte("data", hoje)
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true })
      .limit(5);

    if (error) throw error;

    reservas = (data ?? []) as unknown as Reserva[];
  } catch {
    erro = true;
  }

  if (erro) {
    return (
      <AssociadoCard title="Próximas reservas">
        <p className="text-sm text-red-600">Não foi possível carregar.</p>
      </AssociadoCard>
    );
  }

  if (reservas.length === 0) {
    return (
      <AssociadoCard title="Próximas reservas">
        <p className="text-sm text-brand-muted">Nenhuma reserva agendada.</p>
      </AssociadoCard>
    );
  }

  return (
    <AssociadoCard title="Próximas reservas">
      <ul className="space-y-2 text-sm">
        {reservas.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between text-brand-ink"
          >
            <span>
              {formatDateBR(r.data)} · {r.hora_inicio.slice(0, 5)}–
              {r.hora_fim.slice(0, 5)}
            </span>
            <span className="text-brand-muted">{nomeQuadra(r)}</span>
          </li>
        ))}
      </ul>
    </AssociadoCard>
  );
}
