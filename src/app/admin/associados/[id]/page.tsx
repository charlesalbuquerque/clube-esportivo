import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateBR } from "@/lib/format";
import { AssociadoStatusForm } from "../AssociadoStatusForm";

export default async function AssociadoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const supabase = await createClient();

  const { data: associado, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, status, joined_at")
    .eq("id", id)
    .single();

  if (error || !associado) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link
        href="/admin/associados"
        className="text-sm text-ink-muted underline"
      >
        ← Voltar
      </Link>

      <div className="mt-4 rounded-lg border border-line-subtle bg-surface p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-ink">
          {associado.full_name}
        </h1>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <dl className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Telefone</dt>
            <dd className="text-ink">{associado.phone ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Associado desde</dt>
            <dd className="text-ink">
              {formatDateBR(associado.joined_at)}
            </dd>
          </div>
        </dl>

        <AssociadoStatusForm
          id={associado.id}
          status={associado.status}
          redirectTo={`/admin/associados/${associado.id}`}
        />
      </div>
    </div>
  );
}
