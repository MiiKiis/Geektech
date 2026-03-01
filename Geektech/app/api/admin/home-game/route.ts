import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const sql = getSQL();
        const data = await sql`SELECT * FROM home_game ORDER BY posicion ASC NULLS LAST, id ASC`;
        return NextResponse.json(data);
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
    try {
        const { nombre, descripcion, precio, imagen_url, categoria, variantes_precio, posicion } = await req.json();
        if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        const sql = getSQL();
        const maxPos = await sql`SELECT COALESCE(MAX(posicion), 0) + 1 as next FROM home_game`;
        const pos = posicion !== undefined ? parseInt(posicion) : maxPos[0].next;
        const result = await sql`
            INSERT INTO home_game (nombre, descripcion, precio, imagen_url, categoria, variantes_precio, posicion)
            VALUES (${nombre.trim()}, ${descripcion || null}, ${precio ? parseFloat(precio) : null},
                    ${imagen_url || '/img/placeholder.jpg'}, ${categoria || 'Juego'}, ${variantes_precio || null}, ${pos})
            RETURNING id`;
        return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
