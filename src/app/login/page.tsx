"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";

const CLUB_NAME = "Clube Esportivo";
const CLUB_INITIALS = "CE";

const STATS = [
  { value: "412", label: "associados ativos" },
  { value: "7", label: "quadras gerenciadas" },
  { value: "1,8k", label: "partidas registradas" },
];

// Puramente visual — indica a intenção de quem está entrando, mas quem
// decide o destino após o login é o `role` do profile no banco (ver
// app/actions/auth.ts).
type Profile = "associado" | "admin";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [profile, setProfile] = useState<Profile>("associado");

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
      <div className="flex flex-col justify-between gap-10 bg-brand-green-900 px-6 py-10 sm:px-10 sm:py-11">
        <div className="flex items-center gap-3">
          <div className="grid h-[34px] w-[34px] place-items-center bg-brand-lime font-display text-base font-bold text-brand-green-900">
            {CLUB_INITIALS}
          </div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#e7efe5]">
            {CLUB_NAME}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-[20ch] text-balance font-display text-4xl font-semibold leading-[1.04] tracking-[-0.015em] text-white sm:text-[54px]">
            A gestão do clube, medida em números.
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-brand-text-dim-2">
            Associados, mensalidades, ocupação de quadras, partidas e ranking
            por pontos — um sistema só, com o mesmo dado para a administração
            e para o associado.
          </p>
          <div className="grid grid-cols-1 gap-px border border-brand-green-border bg-brand-green-border sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-brand-green-850 px-3.5 py-4">
                <div className="font-club-mono text-2xl text-brand-lime sm:text-[26px]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-brand-text-faint-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div />
      </div>

      <div className="flex items-center border-t border-brand-border bg-brand-surface-alt px-6 py-10 lg:border-t-0 lg:border-l lg:px-10">
        <div className="flex w-full flex-col gap-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
              Acesso ao sistema
            </div>
            <h2 className="mt-[7px] font-display text-3xl font-semibold tracking-[-0.01em] text-brand-ink">
              Identifique-se
            </h2>
          </div>

          <div className="grid grid-cols-2 border border-brand-input-border text-[13px]">
            <button
              type="button"
              onClick={() => setProfile("associado")}
              className={
                profile === "associado"
                  ? "bg-brand-green-700 px-3 py-2.5 font-semibold text-white"
                  : "bg-brand-surface px-3 py-2.5 text-brand-muted-2"
              }
            >
              Associado
            </button>
            <button
              type="button"
              onClick={() => setProfile("admin")}
              className={
                profile === "admin"
                  ? "border-l border-brand-input-border bg-brand-green-700 px-3 py-2.5 font-semibold text-white"
                  : "border-l border-brand-input-border bg-brand-surface px-3 py-2.5 text-brand-muted-2"
              }
            >
              Administração
            </button>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                E-mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="border border-brand-input-border bg-brand-surface px-[13px] py-3 text-sm text-brand-ink outline-none focus:border-brand-green-700 focus:outline-2 focus:outline-brand-focus-ring"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                Senha
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="border border-brand-input-border bg-brand-surface px-[13px] py-3 text-sm text-brand-ink outline-none focus:border-brand-green-700 focus:outline-2 focus:outline-brand-focus-ring"
              />
            </label>

            <div className="flex items-center justify-between text-[13px] text-brand-muted-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-brand-green-700"
                />
                Manter conectado
              </label>
              <span className="cursor-not-allowed text-brand-muted-2/70">
                Esqueci a senha
              </span>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 bg-brand-green-700 px-4 py-[13px] text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-brand-green-800 disabled:opacity-50"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="border-t border-[#e6e8e2] pt-4 text-[13px] leading-relaxed text-brand-muted-2">
            Ainda não tem acesso?{" "}
            <Link href="/cadastro" className="text-brand-green-700 hover:text-brand-green-800 hover:underline">
              Solicitar cadastro
            </Link>
            . A liberação é feita pela secretaria após conferência dos dados.
          </p>
        </div>
      </div>
    </div>
  );
}
