export function pesoToCentavos(value: number): number {
  return Math.round(value * 100);
}

export function centavosToPeso(value: number): number {
  return value / 100;
}

export function formatPeso(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}
