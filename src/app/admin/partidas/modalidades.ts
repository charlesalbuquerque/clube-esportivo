export type Modalidade = "tenis_simples" | "tenis_duplas" | "beach_tennis";

export const MODALIDADES: { value: Modalidade; label: string }[] = [
  { value: "tenis_simples", label: "Tênis · simples" },
  { value: "tenis_duplas", label: "Tênis · duplas" },
  { value: "beach_tennis", label: "Beach tennis" },
];

export function isModalidade(valor: string): valor is Modalidade {
  return MODALIDADES.some((m) => m.value === valor);
}
