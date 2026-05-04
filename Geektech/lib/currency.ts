import sql from './db';

// Obtiene el valor actual del dólar desde la BD
export async function getExchangeRate(): Promise<number> {
    try {
        const result = await sql`SELECT value FROM settings WHERE key = 'usd_to_bs'`;
        if (result.length > 0) {
            return parseFloat(result[0].value);
        }
    } catch (e) {
        console.error("Error obteniendo tasa de cambio", e);
    }
    return 1; // Fallback
}

// Convierte un precio de USD a Bs
export async function convertToBs(priceUsd: number): Promise<number> {
    const rate = await getExchangeRate();
    return priceUsd * rate;
}
