import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion } = body;
        if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        const sql = getSQL();
        await sql`
            UPDATE componentes_pcs SET
                nombre=${nombre.trim()}, descripcion=${descripcion?.trim() || null},
                precio=${precio ? parseFloat(precio) : null},
                imagen_url=${imagen_url?.trim() || '/img/placeholder.jpg'},
                categoria=${categoria?.trim() || 'Componentes'}, tipo=${tipo?.trim() || null},
                variantes_precio=${variantes_precio?.trim() || null},
                posicion=${posicion !== undefined ? parseInt(posicion) : null}
            WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const sql = getSQL();
        await sql`DELETE FROM componentes_pcs WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

// PATCH — solo actualizar posición (para flechas arriba/abajo)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { posicion } = await req.json();
        const sql = getSQL();
        await sql`UPDATE componentes_pcs SET posicion=${parseInt(posicion)} WHERE id=${parseInt(id)}`;
        return NextResponse.json({ success: true });
    } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
