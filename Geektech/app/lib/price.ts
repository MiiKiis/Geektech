export type PriceVariant = { label: string; value: string | number };

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
          .filter((p: any) => p && typeof p.label === 'string')
          .map((p: any) => ({ 
            label: p.label, 
            value: p.value // Allow both strings and numbers
          }));
      }
    } catch {
      // Fall through to legacy parser
    }
  }

  // Legacy "Label:value,Label:value" format
  return trimmed.split(',').map(p => {
    const [label, val] = p.split(':');
    const value = (val || '').trim();
    return { label: label?.trim(), value };
  }).filter(x => x.label);
}

/**
 * Returns a display-friendly price string for a product row.
 */
export function mostrarPrecio(producto: any): string {
  // Has real price value
  if (producto.precio !== null && producto.precio !== undefined && producto.precio !== '') {
    const num = parseFloat(String(producto.precio));
    if (!isNaN(num) && num > 0) return `Bs ${num.toFixed(2)}`;
    if (typeof producto.precio === 'string' && producto.precio.trim().length > 0) return producto.precio;
  }

  // Has price variants — show "desde Bs X" or first value
  if (producto.variantes_precio) {
    const variants = parsePrices(producto.variantes_precio);
    if (variants.length > 0) {
      // Find minimum numeric price if possible
      const numericPrices = variants
        .map(v => typeof v.value === 'string' ? parseFloat(v.value) : v.value)
        .filter(v => !isNaN(v) && v > 0);

      if (numericPrices.length > 0) {
        const min = Math.min(...numericPrices);
        return `Desde Bs ${min.toFixed(2)}`;
      }
      
      // If no numeric prices, show the first variant's value
      return String(variants[0].value);
    }
  }

  return 'Consultar';
}
