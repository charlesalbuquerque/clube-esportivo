"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-alt px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-line-subtle bg-surface p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-ink">
          Criar conta
        </h1>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-ink-soft">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-ink-soft">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-ink-soft"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded border border-line px-3 py-2 text-sm outline-none focus:border-focus bg-surface text-ink"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state?.message && (
            <p className="text-sm text-green-700">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-sm text-ink-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-ink underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
