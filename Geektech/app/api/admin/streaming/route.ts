import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const sql = getSQL();
        const data = await sql`
            SELECT * FROM cuentas_streaming
            ORDER BY destacado DESC NULLS LAST, posicion ASC NULLS LAST, id ASC
        `;
        return NextResponse.json(data);
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
    try {
        const { nombre, descripcion, precio, imagen_url, plataforma, duracion, variantes_precio, posicion, destacado, agotado, imagenes_adicionales } = await req.json();
        const sql = getSQL();

        const maxPos = await sql`SELECT COALESCE(MAX(posicion), 0) + 1 as next FROM cuentas_streaming`;
        const parsedPos = parseInt(posicion);
        const pos = !isNaN(parsedPos) ? parsedPos : maxPos[0].next;

        const parsedPrecio = parseFloat(precio);
        const validPrecio = !isNaN(parsedPrecio) ? parsedPrecio : null;

        const imgs = Array.isArray(imagenes_adicionales) ? JSON.stringify(imagenes_adicionales) : '[]';

        const result = await sql`INSERT INTO cuentas_streaming
            (nombre, descripcion, precio, imagen_url, plataforma, duracion, variantes_precio, posicion, destacado, agotado, imagenes_adicionales)
            VALUES (${nombre}, ${descripcion || null}, ${validPrecio},
            ${imagen_url || '/img/placeholder.jpg'}, ${plataforma || null}, ${duracion || null},
            ${variantes_precio || null}, ${pos}, ${destacado ? true : false}, ${agotado ? true : false}, ${imgs}) RETURNING id`;
        return NextResponse.json({ success: true, id: result[0].id });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
