import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no configurada');
    return neon(process.env.DATABASE_URL);
};

export async function GET() {
    try {
        const sql = getSQL();
        const data = await sql`
            SELECT * FROM componentes_pcs
            ORDER BY posicion ASC NULLS LAST, id ASC
        `;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion } = await req.json();
        if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        const sql = getSQL();

        // Obtener la posición máxima actual para poner el nuevo al final por defecto
        const maxPos = await sql`SELECT COALESCE(MAX(posicion), 0) + 1 as next FROM componentes_pcs`;
        const pos = posicion !== undefined ? parseInt(posicion) : maxPos[0].next;

        const result = await sql`
            INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion)
            VALUES (
                ${nombre.trim()}, ${descripcion?.trim() || null},
                ${precio ? parseFloat(precio) : null},
                ${imagen_url?.trim() || '/img/placeholder.jpg'},
                ${categoria?.trim() || 'Componentes'}, ${tipo?.trim() || null},
                ${variantes_precio?.trim() || null}, ${pos}
            )
            RETURNING id`;
        return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
