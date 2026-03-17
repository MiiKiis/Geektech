import { sql } from '@/lib/db';
import { normalizeImagesPayload, normalizeNumericPrice, normalizePosition, normalizeVariantsPayload } from '@/lib/adminProductPayload';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
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
        if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

        const maxPos = await sql`SELECT COALESCE(MAX(posicion), 0) + 1 as next FROM cuentas_streaming`;
        const pos = normalizePosition(posicion) ?? maxPos[0].next;
        const validPrecio = normalizeNumericPrice(precio);
        const validVariantes = normalizeVariantsPayload(variantes_precio);
        const imgs = normalizeImagesPayload(imagenes_adicionales);

        const result = await sql`INSERT INTO cuentas_streaming
            (nombre, descripcion, precio, imagen_url, plataforma, duracion, variantes_precio, posicion, destacado, agotado, imagenes_adicionales)
            VALUES (${nombre.trim()}, ${descripcion?.trim() || null}, ${validPrecio},
            ${imagen_url?.trim() || '/img/placeholder.jpg'}, ${plataforma?.trim() || null}, ${duracion?.trim() || null},
            ${validVariantes}, ${pos}, ${destacado ? true : false}, ${agotado ? true : false}, ${imgs}) RETURNING id`;
        return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
