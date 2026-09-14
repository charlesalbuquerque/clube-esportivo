import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function Home() {
  const profile = await getCurrentProfile();

  // O proxy.ts já redireciona quem não está autenticado pro /login,
  // então aqui só falta mandar cada role pra sua área.
  redirect(profile?.role === "admin" ? "/admin" : "/associado");
}
