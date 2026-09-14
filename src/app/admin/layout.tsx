import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

async function getAdminCounts() {
  try {
    const supabase = await createClient();

    // Mês corrente no fuso do servidor (mesmo critério do MensalidadesCard).
    const now = new Date();
    const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const [associados, quadras, mensalidades] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "associado"),
      supabase.from("quadras").select("id", { count: "exact", head: true }),
      supabase
        .from("mensalidades")
        .select("id", { count: "exact", head: true })
        .eq("referencia_mes", mesAtual)
        .in("status", ["pendente", "atrasado"]),
    ]);

    return {
      associados: associados.count ?? undefined,
      quadras: quadras.count ?? undefined,
      mensalidadesEmAberto: mensalidades.count ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await getCurrentProfile();

  // O proxy.ts já garante sessão + role === 'admin' antes de chegar aqui.
  if (!profile) {
    redirect("/login");
  }

  const counts = await getAdminCounts();

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[226px_minmax(0,1fr)]">
      <Sidebar
        navRole="admin"
        fullName={profile.full_name}
        isAdmin={profile.role === "admin"}
        counts={counts}
      />
      <main className="min-w-0 bg-brand-bg">{children}</main>
    </div>
  );
}
