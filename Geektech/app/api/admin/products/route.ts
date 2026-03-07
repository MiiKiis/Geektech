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
            ORDER BY destacado DESC NULLS LAST, posicion ASC NULLS LAST, id ASC
        `;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion, destacado, agotado, imagenes_adicionales } = await req.json();
        if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        const sql = getSQL();

        // Obtener la posición máxima actual para poner el nuevo al final por defecto
        const maxPos = await sql`SELECT COALESCE(MAX(posicion), 0) + 1 as next FROM componentes_pcs`;
        const parsedPos = parseInt(posicion);
        const pos = !isNaN(parsedPos) ? parsedPos : maxPos[0].next;

        const parsedPrecio = parseFloat(precio);
        const validPrecio = !isNaN(parsedPrecio) ? parsedPrecio : null;

        const imgs = Array.isArray(imagenes_adicionales) ? JSON.stringify(imagenes_adicionales) : '[]';

        const result = await sql`
            INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion, destacado, agotado, imagenes_adicionales)
            VALUES (
                ${nombre.trim()}, ${descripcion?.trim() || null},
                ${validPrecio},
                ${imagen_url?.trim() || '/img/placeholder.jpg'},
                ${categoria?.trim() || 'Componentes'}, ${tipo?.trim() || null},
                ${variantes_precio?.trim() || null}, ${pos}, ${destacado ? true : false}, ${agotado ? true : false}, ${imgs}
            )
            RETURNING id`;
        return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
