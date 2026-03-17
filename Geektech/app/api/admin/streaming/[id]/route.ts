import { sql } from '@/lib/db';
import { normalizeImagesPayload, normalizeNumericPrice, normalizePosition, normalizeVariantsPayload } from '@/lib/adminProductPayload';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre, descripcion, precio, imagen_url, plataforma, duracion, variantes_precio, posicion, destacado, agotado, imagenes_adicionales } = await req.json();
        const validPos = normalizePosition(posicion);
        const validPrecio = normalizeNumericPrice(precio);
        const validVariantes = normalizeVariantsPayload(variantes_precio);
        const imgs = normalizeImagesPayload(imagenes_adicionales);

        await sql`UPDATE cuentas_streaming SET 
            nombre=${nombre?.trim()}, descripcion=${descripcion?.trim() || null}, precio=${validPrecio},
            imagen_url=${imagen_url?.trim() || '/img/placeholder.jpg'}, plataforma=${plataforma?.trim() || null},
            duracion=${duracion?.trim() || null}, variantes_precio=${validVariantes},
            posicion=${validPos}, destacado=${destacado ? true : false}, agotado=${agotado ? true : false}, imagenes_adicionales=${imgs}
            WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await sql`DELETE FROM cuentas_streaming WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { posicion, destacado, agotado } = await req.json();
        const idNum = parseInt(id);

        if (posicion !== undefined) {
            await sql`UPDATE cuentas_streaming SET posicion=${normalizePosition(posicion)} WHERE id=${idNum}`;
        }
        if (destacado !== undefined) {
            await sql`UPDATE cuentas_streaming SET destacado=${destacado ? true : false} WHERE id=${idNum}`;
        }
        if (agotado !== undefined) {
            await sql`UPDATE cuentas_streaming SET agotado=${agotado ? true : false} WHERE id=${idNum}`;
        }
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
