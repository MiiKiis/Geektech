import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre, descripcion, precio, imagen_url, categoria, variantes_precio, posicion } = await req.json();
        const sql = getSQL();
        await sql`UPDATE home_game SET 
            nombre=${nombre}, descripcion=${descripcion || null}, precio=${precio ? parseFloat(precio) : null},
            imagen_url=${imagen_url || '/img/placeholder.jpg'}, categoria=${categoria || 'Juego'},
            variantes_precio=${variantes_precio || null}, posicion=${posicion !== undefined ? parseInt(posicion) : null}
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
        await getSQL()`UPDATE home_game SET posicion=${parseInt(posicion)} WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
