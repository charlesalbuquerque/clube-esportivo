"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const CLUB_NAME = "Conexão Esportiva";
const CLUB_INITIALS = "CE";

type NavItem = {
  label: string;
  href: string;
  count?: number;
};

export type SidebarProps = {
  /** Qual conjunto de nav exibir — a seção atual (admin ou associado). */
  navRole: "admin" | "associado";
  fullName: string;
  /** Role real do profile logado (pode ser admin mesmo com navRole "associado" — ver como associado). */
  isAdmin: boolean;
  counts?: {
    associados?: number;
    mensalidadesEmAberto?: number;
    quadras?: number;
  };
};

function isItemActive(pathname: string, href: string) {
  return href === "/admin" || href === "/associado"
    ? pathname === href
    : pathname.startsWith(href);
}

function NavMarker({ active }: { active: boolean }) {
  return (
    <span
      className={
        "h-[5px] w-[5px] shrink-0 " + (active ? "bg-brand-lime" : "bg-[#4a7a5a]")
      }
    />
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={
        "flex items-center gap-2.5 px-2 py-2.5 text-[13px] " +
        (active
          ? "bg-brand-green-800b font-semibold text-white"
          : "text-brand-text-dim hover:text-white")
      }
    >
      <NavMarker active={active} />
      <span className="flex-1">{item.label}</span>
      {typeof item.count === "number" && (
        <span className="font-club-mono text-[10px] text-brand-text-faint-2">
          {item.count}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ navRole, fullName, isAdmin, counts }: SidebarProps) {
  const pathname = usePathname();

  const adminItems: NavItem[] = [
    { label: "Painel geral", href: "/admin" },
    { label: "Associados", href: "/admin/associados", count: counts?.associados },
    {
      label: "Mensalidades",
      href: "/admin/mensalidades",
      count: counts?.mensalidadesEmAberto,
    },
    { label: "Quadras", href: "/admin/quadras", count: counts?.quadras },
    { label: "Partidas e ranking", href: "/admin/partidas" },
  ];

  const associadoItems: NavItem[] = [
    { label: "Minha área", href: "/associado" },
    { label: "Reservar quadra", href: "/associado/reservas" },
    { label: "Mensalidades", href: "/associado/mensalidades" },
    { label: "Meu perfil", href: "/associado/perfil" },
  ];

  const items = navRole === "admin" ? adminItems : associadoItems;
  const groupLabel = navRole === "admin" ? "Administração" : "Meu clube";

  return (
    <aside className="flex flex-col gap-6 bg-brand-green-900 px-3 py-[18px]">
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="grid h-7 w-7 place-items-center bg-brand-lime font-display text-[13px] font-bold text-brand-green-900">
          {CLUB_INITIALS}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e7efe5]">
          {CLUB_NAME}
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-text-faint">
          {groupLabel}
        </div>
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}

          {navRole === "admin" && (
            <li>
              <Link
                href="/associado"
                className="flex items-center gap-2.5 px-2 py-2.5 text-[13px] text-brand-text-dim hover:text-white"
              >
                <NavMarker active={false} />
                <span className="flex-1">Ver como associado</span>
              </Link>
            </li>
          )}

          {navRole === "associado" && isAdmin && (
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-2 py-2.5 text-[13px] text-brand-text-dim hover:text-white"
              >
                <NavMarker active={false} />
                <span className="flex-1">Voltar à administração</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-2.5">
        <div className="border border-brand-green-border bg-brand-green-850 px-3 py-3">
          <p className="truncate text-[13px] font-medium text-white">
            {fullName}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-brand-text-faint-2">
            {isAdmin ? "Administração" : "Associado"}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="px-2 text-left text-[12px] text-[#7f9d86] hover:text-brand-lime"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
