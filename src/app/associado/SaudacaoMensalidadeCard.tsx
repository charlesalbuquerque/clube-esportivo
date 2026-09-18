import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { formatBRL } from "@/lib/format";
import { AssociadoCard } from "./AssociadoCard";

export async function SaudacaoMensalidadeCard() {
  const profile = await getCurrentProfile();

  let status: "pago" | "pendente" | "atrasado" | null = null;
  let valor: number | null = null;
  let erro = false;

  try {
    if (!profile) throw new Error("Sem perfil.");

    const supabase = await createClient();

    // Mesmo cálculo de mês do MensalidadesCard do admin — não usa
    // toISOString() (converte pra UTC, pode virar o mês perto da virada do dia).
    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("mensalidades")
      .select("status, valor")
      .eq("associado_id", profile.id)
      .eq("referencia_mes", mesAtual)
      .maybeSingle();

    if (error) throw error;

    status = (data?.status ?? null) as typeof status;
    valor = data ? Number(data.valor) : null;
  } catch {
    erro = true;
  }

  const atrasada = status === "atrasado";

  return (
    <AssociadoCard title="Sua mensalidade">
      <p className="font-display text-xl font-semibold text-brand-ink">
        Olá, {profile?.full_name ?? "associado"}!
      </p>

      {erro && (
        <p className="mt-3 text-sm text-red-600">
          Não foi possível carregar sua mensalidade.
        </p>
      )}

      {!erro && status === null && (
        <p className="mt-3 text-sm text-brand-muted">
          Nenhuma mensalidade lançada para este mês.
        </p>
      )}

      {!erro && status !== null && (
        <div
          className={`mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium ${
            atrasada
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-brand-border bg-brand-surface-alt text-brand-ink"
          }`}
        >
          Mensalidade do mês: <strong className="uppercase">{status}</strong>
          {valor !== null && <span>· {formatBRL(valor)}</span>}
        </div>
      )}
    </AssociadoCard>
  );
}
