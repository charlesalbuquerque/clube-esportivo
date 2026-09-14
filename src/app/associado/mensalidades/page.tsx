import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateBR,
  formatMonthBR,
  formatBRL,
  mensalidadeStatusClass,
} from "@/lib/format";

export default async function MinhasMensalidadesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: mensalidades, error } = user
    ? await supabase
        .from("mensalidades")
        .select("id, referencia_mes, valor, status, data_pagamento")
        .eq("associado_id", user.id)
        .order("referencia_mes", { ascending: false })
    : { data: null, error: null };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">
          Minhas mensalidades
        </h1>
        <Link href="/associado" className="text-sm text-ink-muted underline">
          Voltar
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar suas mensalidades.
        </p>
      )}

      {!error && mensalidades?.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nenhuma mensalidade lançada ainda.
        </p>
      )}

      {!error && mensalidades && mensalidades.length > 0 && (
        <div className="overflow-x-auto rounded border border-line-subtle bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line-subtle bg-surface-alt text-left text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Mês</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Pago em</th>
              </tr>
            </thead>
            <tbody>
              {mensalidades.map((m) => (
                <tr key={m.id} className="border-b border-line-subtle last:border-0">
                  <td className="px-4 py-2 text-ink">
                    {formatMonthBR(m.referencia_mes)}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{formatBRL(m.valor)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${mensalidadeStatusClass(m.status)}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">
                    {m.data_pagamento ? formatDateBR(m.data_pagamento) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
