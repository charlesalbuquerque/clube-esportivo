import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPartida } from "@/app/actions/partidas";
import EquipeSelector from "./EquipeSelector";

export default async function PartidasPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  const supabase = await createClient();

  const [{ data: associados }, { data: quadras }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "associado")
      .eq("status", "ativo")
      .order("full_name"),

    supabase
      .from("quadras")
      .select("id, nome")
      .order("nome"),
  ]);

  const redirectTo = "/admin/partidas";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/admin"
            className="text-sm text-ink-muted hover:text-ink"
          >
            ← Voltar para o painel
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-ink">
          Registrar partida
        </h1>

        <p className="mt-2 text-sm text-ink-muted">
          Registre o resultado de uma partida individual ou em equipe.
        </p>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* FORMULÁRIO */}
      <div className="rounded-2xl border border-line-subtle bg-surface p-6 shadow-sm">
        <form
          action={createPartida.bind(null, redirectTo)}
          className="space-y-6"
        >
          {/* TIPO */}
          <div>
            <label
              htmlFor="tipo"
              className="mb-2 block text-sm font-medium text-ink-soft"
            >
              Tipo de partida
            </label>

            <select
              id="tipo"
              name="tipo"
              required
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            >
              <option value="individual">
                Individual
              </option>

              <option value="equipe">
                Em equipe
              </option>
            </select>
          </div>

          {/* DATA */}
          <div>
            <label
              htmlFor="data"
              className="mb-2 block text-sm font-medium text-ink-soft"
            >
              Data
            </label>

            <input
              id="data"
              name="data"
              type="date"
              required
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            />
          </div>

          {/* QUADRA */}
          <div>
            <label
              htmlFor="quadra_id"
              className="mb-2 block text-sm font-medium text-ink-soft"
            >
              Quadra
            </label>

            <select
              id="quadra_id"
              name="quadra_id"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            >
              <option value="">
                Nenhuma quadra
              </option>

              {quadras?.map((quadra) => (
                <option
                  key={quadra.id}
                  value={quadra.id}
                >
                  {quadra.nome}
                </option>
              ))}
            </select>
          </div>

          {/* PARTIDA INDIVIDUAL */}
          <div className="rounded-xl border border-line-subtle bg-surface-alt p-4">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Partida individual
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* JOGADOR 1 */}
              <div>
                <label
                  htmlFor="jogador1_id"
                  className="mb-2 block text-sm font-medium text-ink-soft"
                >
                  Jogador 1
                </label>

                <select
                  id="jogador1_id"
                  name="jogador1_id"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-focus"
                >
                  <option value="">
                    Selecione
                  </option>

                  {associados?.map((associado) => (
                    <option
                      key={associado.id}
                      value={associado.id}
                    >
                      {associado.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* JOGADOR 2 */}
              <div>
                <label
                  htmlFor="jogador2_id"
                  className="mb-2 block text-sm font-medium text-ink-soft"
                >
                  Jogador 2
                </label>

                <select
                  id="jogador2_id"
                  name="jogador2_id"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-focus"
                >
                  <option value="">
                    Selecione
                  </option>

                  {associados?.map((associado) => (
                    <option
                      key={associado.id}
                      value={associado.id}
                    >
                      {associado.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PARTIDA EM EQUIPE */}
          <EquipeSelector
            associados={associados ?? []}
          />

          {/* PLACAR */}
          <div className="rounded-xl border border-line-subtle bg-surface-alt p-4">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Resultado
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* PLACAR 1 */}
              <div>
                <label
                  htmlFor="placar1"
                  className="mb-2 block text-sm font-medium text-ink-soft"
                >
                  Placar lado A / jogador 1
                </label>

                <input
                  id="placar1"
                  name="placar1"
                  type="number"
                  min="0"
                  required
                  defaultValue="0"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
                />
              </div>

              {/* PLACAR 2 */}
              <div>
                <label
                  htmlFor="placar2"
                  className="mb-2 block text-sm font-medium text-ink-soft"
                >
                  Placar lado B / jogador 2
                </label>

                <input
                  id="placar2"
                  name="placar2"
                  type="number"
                  min="0"
                  required
                  defaultValue="0"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
                />
              </div>
            </div>
          </div>

          {/* BOTÃO */}
          <div className="flex justify-end border-t border-line-subtle pt-5">
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Registrar partida
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}