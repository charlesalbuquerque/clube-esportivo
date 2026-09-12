/**
 * Formata uma data no formato "YYYY-MM-DD" (como vem das colunas `date` do
 * Postgres) pra "DD/MM/YYYY", sem passar por `Date` — evita o típico bug de
 * fuso horário onde `new Date("2026-09-01")` vira 31/08 em GMT-3.
 */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Mesma lógica de formatDateBR, mas só mês/ano (pra `referencia_mes`). */
export function formatMonthBR(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  return `${month}/${year}`;
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Classes Tailwind pra destacar o status de uma mensalidade. */
export function mensalidadeStatusClass(status: string): string {
  switch (status) {
    case "pago":
      return "bg-green-50 text-green-700";
    case "atrasado":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}
