/**
 * Safe fetch wrapper que maneja errores de respuesta HTML
 * Evita el error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; ok: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!res.ok) {
      let errorMsg = `Error ${res.status}`;
      if (isJson) {
        try {
          const json = await res.json();
          errorMsg = json.error || json.message || errorMsg;
        } catch {
          errorMsg = `Error ${res.status}: ${res.statusText}`;
        }
      } else {
        errorMsg = `Server error: ${res.statusText}`;
      }
      return { data: null, error: errorMsg, ok: false };
    }

    if (!isJson) {
      return {
        data: null,
        error: `Expected JSON, got ${contentType || 'unknown'} content type`,
        ok: false,
      };
    }

    const data = await res.json();
    return { data, error: null, ok: true };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Network or parsing error',
      ok: false,
    };
  }
}
