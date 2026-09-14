import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/format";
import { AssociadoStatusForm } from "./AssociadoStatusForm";

export default async function AssociadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; erro?: string }>;
}) {
  const { q = "", erro } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, status, joined_at")
    .eq("role", "associado")
    .order("full_name");

  if (q) {
    query = query.ilike("full_name", `%${q}%`);
  }

  const { data: associados, error } = await query;

  const redirectTo = q
    ? `/admin/associados?q=${encodeURIComponent(q)}`
    : "/admin/associados";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          Associados
        </h1>

        <Link
          href="/associado"
          className="text-sm text-zinc-600 underline"
        >
          Voltar
        </Link>
      </div>

      {/* Busca */}
      <form method="get" className="mb-3 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome..."
          className="w-full max-w-xs rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />

        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Buscar
        </button>
      </form>

      {/* Novo associado */}
      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/associados/novo"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Novo associado
        </Link>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <p className="mb-4 text-sm text-red-600">
          {erro}
        </p>
      )}

      {/* Erro ao carregar associados */}
      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar a lista de associados.
        </p>
      )}

      {/* Nenhum associado */}
      {!error && associados?.length === 0 && (
        <p className="text-sm text-zinc-600">
          Nenhum associado encontrado.
        </p>
      )}

      {/* Lista de associados */}
      {!error && associados && associados.length > 0 && (
        <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-2 font-medium">
                  Nome
                </th>

                <th className="px-4 py-2 font-medium">
                  Telefone
                </th>

                <th className="px-4 py-2 font-medium">
                  Associado desde
                </th>

                <th className="px-4 py-2 font-medium">
                  Status
                </th>

                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {associados.map((associado) => (
                <tr
                  key={associado.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-2 text-zinc-900">
                    {associado.full_name}
                  </td>

                  <td className="px-4 py-2 text-zinc-600">
                    {associado.phone ?? "—"}
                  </td>

                  <td className="px-4 py-2 text-zinc-600">
                    {formatDateBR(associado.joined_at)}
                  </td>

                  <td className="px-4 py-2">
                    <AssociadoStatusForm
                      id={associado.id}
                      status={associado.status}
                      redirectTo={redirectTo}
                    />
                  </td>

                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/associados/${associado.id}`}
                      className="text-xs text-zinc-600 underline"
                    >
                      Ver detalhes
                    </Link>
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