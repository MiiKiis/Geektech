export type PriceVariant = { label: string; value: number };

/**
 * Parses price variants from either:
 *   - JSON array:   '[{"label":"8GB","value":22},...]'   (new DB format)
 *   - Legacy string: '8GB:22,16GB:42'                    (old format)
 */
export function parsePrices(str: string | null | undefined): PriceVariant[] {
  if (!str) return [];
  const trimmed = str.trim();

  // Try JSON array first
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((p: any) => p && typeof p.label === 'string' && typeof p.value === 'number')
          .map((p: any) => ({ label: p.label, value: p.value }));
      }
    } catch {
      // Fall through to legacy parser
    }
  }

  // Legacy "Label:value,Label:value" format
  return trimmed.split(',').map(p => {
    const [label, val] = p.split(':');
    const num = parseFloat((val || '').trim());
    return { label: label?.trim(), value: isNaN(num) ? 0 : num };
  }).filter(x => x.label && !isNaN(x.value));
}

/**
 * Returns a display-friendly price string for a product row.
 */
export function mostrarPrecio(producto: any): string {
  // Has real price value
  if (producto.precio !== null && producto.precio !== undefined && producto.precio !== '') {
    const num = Number(producto.precio);
    if (!isNaN(num) && num > 0) return `Bs ${num.toFixed(2)}`;
  }

  // Has price variants — show "desde Bs X"
  if (producto.variantes_precio) {
    const variants = parsePrices(producto.variantes_precio);
    if (variants.length > 0) {
      const min = Math.min(...variants.map(v => v.value));
      return `Desde Bs ${min.toFixed(2)}`;
    }
  }

  return 'Consultar';
}
