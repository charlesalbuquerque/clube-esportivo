import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

const CLUB_NAME = "Clube Esportivo";
const CLUB_INITIALS = "CE";

const STATS = [
  { value: "412", label: "associados ativos" },
  { value: "7", label: "quadras gerenciadas" },
  { value: "1,8k", label: "partidas registradas" },
];

const FEATURES = [
  {
    title: "Associados",
    description:
      "Cadastro, categorias, modalidades e situação de cada associado.",
  },
  {
    title: "Mensalidades",
    description:
      "Cobranças por competência, status de pagamento e inadimplência.",
  },
  {
    title: "Quadras e reservas",
    description: "Grade quadra × horário com reserva, aula e manutenção.",
  },
  {
    title: "Partidas e ranking",
    description: "Registro de partidas e ranking por pontos corridos.",
  },
];

export default async function Home() {
  const profile = await getCurrentProfile();

  // Quem já está autenticado não vê a landing page — vai direto pra área dele.
  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/associado");
  }

  return (
    <div className="flex flex-1 flex-col bg-brand-bg font-club-sans text-brand-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border bg-brand-surface-alt px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center bg-brand-lime font-display text-[13px] font-bold text-brand-green-900">
            {CLUB_INITIALS}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink">
            {CLUB_NAME}
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-green-700 hover:text-brand-green-800"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="border border-brand-green-700 bg-brand-green-700 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white hover:border-brand-green-800 hover:bg-brand-green-800"
          >
            Solicitar cadastro
          </Link>
        </nav>
      </header>

      <section className="bg-brand-green-900 px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <h1 className="max-w-[20ch] text-balance font-display text-4xl font-semibold leading-[1.04] tracking-[-0.015em] text-white sm:text-5xl lg:text-[54px]">
            A gestão do clube, medida em números.
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-brand-text-dim-2">
            Associados, mensalidades, ocupação de quadras, partidas e ranking
            por pontos — um sistema só, com o mesmo dado para a administração
            e para o associado.
          </p>

          <div className="grid grid-cols-1 gap-px border border-brand-green-border bg-brand-green-border sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-brand-green-850 px-4 py-4">
                <div className="font-club-mono text-2xl text-brand-lime sm:text-[26px]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-brand-text-faint-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cadastro"
              className="bg-brand-lime px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-green-900 hover:opacity-90"
            >
              Solicitar cadastro
            </Link>
            <Link
              href="/login"
              className="border border-brand-green-border-soft px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:border-brand-lime hover:text-brand-lime"
            >
              Já tenho acesso — Entrar
            </Link>
          </div>
        </div>
      </section>

      <section className="flex-1 px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <h2 className="font-display text-2xl font-semibold text-brand-ink">
            Tudo o que a secretaria e o associado precisam, num só lugar.
          </h2>

          <div className="grid grid-cols-1 gap-px border border-brand-border bg-brand-border sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-brand-surface p-5">
                <h3 className="text-[13px] font-semibold text-brand-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-brand-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-border bg-brand-surface-alt px-6 py-6 text-[11px] uppercase tracking-[0.06em] text-brand-muted sm:px-10">
        {CLUB_NAME} · Sistema de gestão esportiva
      </footer>
    </div>
  );
}
