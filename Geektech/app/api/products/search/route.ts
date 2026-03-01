import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }

        const sql = neon(process.env.DATABASE_URL);
        const searchTerm = `%${query}%`;

        const [homeGame, componentes, streaming] = await Promise.allSettled([
            sql`SELECT id, nombre, imagen_url, categoria FROM home_game WHERE LOWER(nombre) LIKE LOWER(${searchTerm}) OR LOWER(categoria) LIKE LOWER(${searchTerm}) LIMIT 5`,
            sql`SELECT id, nombre, imagen_url, categoria, tipo, precio FROM componentes_pcs WHERE LOWER(nombre) LIKE LOWER(${searchTerm}) OR LOWER(categoria) LIKE LOWER(${searchTerm}) OR LOWER(tipo) LIKE LOWER(${searchTerm}) LIMIT 5`,
            sql`SELECT id, nombre, imagen_url, plataforma, duracion, precio FROM cuentas_streaming WHERE LOWER(nombre) LIKE LOWER(${searchTerm}) OR LOWER(plataforma) LIKE LOWER(${searchTerm}) LIMIT 5`,
        ]);

        const results = [
            ...(homeGame.status === 'fulfilled' ? homeGame.value : []).map((p: any) => ({
                id: p.id,
                nombre: p.nombre,
                imagen_url: p.imagen_url,
                category: 'Juegos',
                subcategory: p.categoria,
                link: '/',
                price: null,
            })),
            ...(componentes.status === 'fulfilled' ? componentes.value : []).map((p: any) => ({
                id: `c-${p.id}`,
                nombre: p.nombre,
                imagen_url: p.imagen_url,
                category: 'Mantenimiento',
                subcategory: p.tipo || p.categoria,
                link: '/mantenimiento-componentes',
                price: p.precio ? parseFloat(p.precio) : null,
            })),
            ...(streaming.status === 'fulfilled' ? streaming.value : []).map((p: any) => ({
                id: `s-${p.id}`,
                nombre: p.nombre,
                imagen_url: p.imagen_url,
                category: 'Streaming',
                subcategory: `${p.plataforma} - ${p.duracion}`,
                link: '/cuentas-streaming',
                price: p.precio ? parseFloat(p.precio) : null,
            })),
        ];

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
