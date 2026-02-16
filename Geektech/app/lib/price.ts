export type PriceVariant = { label: string; value: number };

export function parsePrices(str: string | null | undefined): PriceVariant[] {
  if (!str) return [];
  return str.split(',').map(p => {
    const [label, val] = p.split(':');
    const num = parseFloat((val || '').trim());
    return { label: label?.trim(), value: isNaN(num) ? 0 : num };
  }).filter(x => x.label && !isNaN(x.value));
}

// Esta función decide qué precio mostrar
export function mostrarPrecio(producto: any): string {
  // Caso 1: Tiene un precio único (como en Streaming)
  if (producto.precio !== null && producto.precio !== undefined && producto.precio !== '') {
    return `Bs ${Number(producto.precio)}`;
  }

  // Caso 2: Tiene variantes (como los créditos)
  if (producto.variantes_precio) {
    const primeraVariante = producto.variantes_precio.split(',')[0]; // Toma la primera
    const parts = primeraVariante.split(':');
    const nombre = parts[0] ? parts[0].trim() : '';
    const valor = parts[1] ? parts[1].trim() : '';
    return `${nombre}: Bs ${valor}`;
  }

  return "Precio no disponible";
}
