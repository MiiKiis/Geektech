import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const revalidate = 0; // Sin caché de Next.js, 100% dinámico

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }
        const sql = neon(process.env.DATABASE_URL);
        const data = await sql`
            SELECT id, nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion
            FROM componentes_pcs
            ORDER BY posicion ASC NULLS LAST, id ASC
        `;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
