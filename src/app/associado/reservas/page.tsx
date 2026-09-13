import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReservasClient } from "./ReservasClient";

type Quadra = {
  id: number;
  nome: string;
  tipo: string;
  descricao: string | null;
};

export default async function ReservasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quadras")
    .select("id, nome, tipo, descricao")
    .order("nome");

  const quadras: Quadra[] = (data ?? []).map((quadra) => ({
    id: Number(quadra.id),
    nome: String(quadra.nome),
    tipo: String(quadra.tipo),
    descricao: quadra.descricao
      ? String(quadra.descricao)
      : null,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Reservar quadra
          </h1>

          <p className="mt-1 text-sm text-zinc-600">
            Escolha uma quadra, uma data e um horário disponível
            para realizar sua reserva.
          </p>
        </div>

        <Link
          href="/associado"
          className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Não foi possível carregar as quadras.
          </p>

          <p className="mt-1 text-xs text-red-600">
            Verifique a conexão com o Supabase e se a tabela
            <strong> quadras </strong>
            está disponível.
          </p>
        </div>
      )}

      {!error && quadras.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center">
          <p className="text-sm text-zinc-600">
            Nenhuma quadra está cadastrada no momento.
          </p>

          <Link
            href="/associado"
            className="mt-4 inline-block text-sm text-zinc-900 underline"
          >
            Voltar para o início
          </Link>
        </div>
      )}

      {quadras.length > 0 && (
        <ReservasClient quadras={quadras} />
      )}
    </main>
  );
}