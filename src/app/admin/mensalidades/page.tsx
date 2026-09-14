import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMonthBR, formatBRL, mensalidadeStatusClass } from "@/lib/format";
import { NovaMensalidadeForm } from "./NovaMensalidadeForm";
import { MarcarPagaButton } from "./MarcarPagaButton";

const STATUS_OPTIONS = ["pago", "pendente", "atrasado"] as const;

export default async function MensalidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; associado?: string; erro?: string }>;
}) {
  const { status = "", associado = "", erro } = await searchParams;
  const supabase = await createClient();

  const { data: associados, error: associadosError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "associado")
    .order("full_name");

  const nomesPorId = new Map((associados ?? []).map((a) => [a.id, a.full_name]));

  let query = supabase
    .from("mensalidades")
    .select("id, associado_id, referencia_mes, valor, status, data_pagamento")
    .order("referencia_mes", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (associado) {
    query = query.eq("associado_id", associado);
  }

  const { data: mensalidades, error } = await query;

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (associado) params.set("associado", associado);
  const queryString = params.toString();
  const redirectTo = queryString
    ? `/admin/mensalidades?${queryString}`
    : "/admin/mensalidades";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Mensalidades</h1>
        <Link href="/admin" className="text-sm text-zinc-600 underline">
          Voltar
        </Link>
      </div>

      {associadosError && (
        <p className="mb-4 text-sm text-red-600">
          Não foi possível carregar a lista de associados.
        </p>
      )}
      {!associadosError && (
        <NovaMensalidadeForm associados={associados ?? []} redirectTo={redirectTo} />
      )}

      <form method="get" className="mb-4 flex flex-wrap gap-2">
        <select
          name="status"
          defaultValue={status}
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          name="associado"
          defaultValue={associado}
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm"
        >
          <option value="">Todos os associados</option>
          {(associados ?? []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Filtrar
        </button>
      </form>

      {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar as mensalidades.
        </p>
      )}

      {!error && mensalidades?.length === 0 && (
        <p className="text-sm text-zinc-600">Nenhuma mensalidade encontrada.</p>
      )}

      {!error && mensalidades && mensalidades.length > 0 && (
        <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-2 font-medium">Associado</th>
                <th className="px-4 py-2 font-medium">Mês</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {mensalidades.map((m) => (
                <tr key={m.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2 text-zinc-900">
                    {nomesPorId.get(m.associado_id) ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">
                    {formatMonthBR(m.referencia_mes)}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{formatBRL(m.valor)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${mensalidadeStatusClass(m.status)}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {m.status !== "pago" && (
                      <MarcarPagaButton id={m.id} redirectTo={redirectTo} />
                    )}
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
