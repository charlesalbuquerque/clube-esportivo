import Link from "next/link";
import { createAssociado } from "@/app/actions/associados";

export default async function NovoAssociadoPage({
  searchParams,
}: {
  searchParams: Promise<{
    erro?: string;
    sucesso?: string;
  }>;
}) {
  const { erro, sucesso } = await searchParams;

  const redirectTo = "/admin/associados/novo";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/admin/associados"
            className="text-sm text-ink-muted hover:text-ink"
          >
            ← Voltar para associados
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-ink">
          Novo associado
        </h1>

        <p className="mt-2 text-sm text-ink-muted">
          Cadastre um novo associado no clube.
        </p>
      </div>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {sucesso}
        </div>
      )}

      <form
        action={createAssociado.bind(null, redirectTo)}
        className="space-y-6 rounded-2xl border border-line-subtle bg-surface p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="full_name"
            className="mb-2 block text-sm font-medium text-ink-soft"
          >
            Nome completo
          </label>

          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="Digite o nome completo"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-ink-soft"
          >
            E-mail
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="exemplo@email.com"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-ink-soft"
          >
            Telefone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(12) 99999-9999"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-ink-soft"
          >
            Senha inicial
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo de 6 caracteres"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
          />

          <p className="mt-1 text-xs text-ink-muted">
            O associado poderá utilizar essa senha para entrar no sistema.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line-subtle pt-5">
          <Link
            href="/admin/associados"
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-alt"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Cadastrar associado
          </button>
        </div>
      </form>
    </main>
  );
}