/**
 * Formata uma data no formato "YYYY-MM-DD" (como vem das colunas `date` do
 * Postgres) pra "DD/MM/YYYY", sem passar por `Date` — evita o típico bug de
 * fuso horário onde `new Date("2026-09-01")` vira 31/08 em GMT-3.
 */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
