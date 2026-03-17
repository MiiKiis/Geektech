import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const revalidate = 0; // Sin caché, siempre refleja cambios en vivo

export async function GET() {
    try {
        const data = await sql`
            SELECT * FROM cuentas_streaming
            ORDER BY destacado DESC NULLS LAST, posicion ASC NULLS LAST, id ASC
        `;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
