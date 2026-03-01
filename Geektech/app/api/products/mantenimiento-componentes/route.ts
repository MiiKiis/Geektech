import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }
        const sql = neon(process.env.DATABASE_URL);
        const data = await sql`
            SELECT id, nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio
            FROM componentes_pcs
            ORDER BY categoria ASC, nombre ASC
        `;
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
