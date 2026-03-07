import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre, descripcion, precio, imagen_url, categoria, variantes_precio, posicion, destacado, agotado, imagenes_adicionales } = await req.json();
        const sql = getSQL();
        const parsedPos = parseInt(posicion);
        const validPos = !isNaN(parsedPos) ? parsedPos : null;

        const parsedPrecio = parseFloat(precio);
        const validPrecio = !isNaN(parsedPrecio) ? parsedPrecio : null;

        const imgs = Array.isArray(imagenes_adicionales) ? JSON.stringify(imagenes_adicionales) : '[]';

        await sql`UPDATE home_game SET 
            nombre=${nombre}, descripcion=${descripcion || null}, precio=${validPrecio},
            imagen_url=${imagen_url || '/img/placeholder.jpg'}, categoria=${categoria || null},
            variantes_precio=${variantes_precio || null}, posicion=${validPos},
            destacado=${destacado ? true : false}, agotado=${agotado ? true : false}, imagenes_adicionales=${imgs}
            WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await getSQL()`DELETE FROM home_game WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { posicion } = await req.json();
        const parsedPos = parseInt(posicion);
        if (!isNaN(parsedPos)) {
            await getSQL()`UPDATE home_game SET posicion=${parsedPos} WHERE id=${parseInt(id)}`;
        }
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
