import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function AssociadoLayout({
  children,
}: LayoutProps<"/associado">) {
  const profile = await getCurrentProfile();

  // O proxy.ts já garante sessão antes de chegar aqui.
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[226px_minmax(0,1fr)]">
      <Sidebar
        navRole="associado"
        fullName={profile.full_name}
        isAdmin={profile.role === "admin"}
      />
      <main className="min-w-0 bg-brand-bg">{children}</main>
    </div>
  );
}
