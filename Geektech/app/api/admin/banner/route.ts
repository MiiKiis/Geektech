import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const getSQL = () => neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const sql = getSQL();
        const data = await sql`SELECT * FROM banner_config WHERE activo = true ORDER BY id DESC LIMIT 1`;
        return NextResponse.json(data[0] ?? null);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { 
            titulo, subtitulo, btn_texto, btn_link, imagen_url, 
            badge1_icon, badge1_text, badge2_icon, badge2_text,
            mant_titulo, mant_subtitulo, mant_imagen_url, mant_btn_texto, mant_msg_whatsapp 
        } = body;
        const sql = getSQL();

        // Siempre actualizar el registro id=1 (upsert)
        const existing = await sql`SELECT id FROM banner_config LIMIT 1`;
        if (existing.length > 0) {
            await sql`
                UPDATE banner_config SET
                    titulo      = ${titulo ?? 'Productos Digitales Sin Límites'},
                    subtitulo   = ${subtitulo ?? ''},
                    btn_texto   = ${btn_texto ?? 'Ver Productos'},
                    btn_link    = ${btn_link ?? '/mantenimiento-componentes'},
                    imagen_url  = ${imagen_url ?? '/img/principal/banner.svg'},
                    badge1_icon = ${badge1_icon ?? '🚀'},
                    badge1_text = ${badge1_text ?? 'Rápido'},
                    badge2_icon = ${badge2_icon ?? '⚡'},
                    badge2_text = ${badge2_text ?? 'Entrega Inmediata'},
                    mant_titulo = ${mant_titulo ?? 'Mantenimiento Profesional de PC'},
                    mant_subtitulo = ${mant_subtitulo ?? ''},
                    mant_imagen_url = ${mant_imagen_url ?? ''},
                    mant_btn_texto = ${mant_btn_texto ?? 'AGENDAR CITA'},
                    mant_msg_whatsapp = ${mant_msg_whatsapp ?? 'Hola! Me interesa un mantenimiento para mi PC.'},
                    updated_at  = NOW()
                WHERE id = ${existing[0].id}
            `;
        } else {
            await sql`
                INSERT INTO banner_config (
                    titulo, subtitulo, btn_texto, btn_link, imagen_url, 
                    badge1_icon, badge1_text, badge2_icon, badge2_text,
                    mant_titulo, mant_subtitulo, mant_imagen_url, mant_btn_texto, mant_msg_whatsapp
                )
                VALUES (
                    ${titulo}, ${subtitulo}, ${btn_texto}, ${btn_link}, ${imagen_url}, 
                    ${badge1_icon}, ${badge1_text}, ${badge2_icon}, ${badge2_text},
                    ${mant_titulo}, ${mant_subtitulo}, ${mant_imagen_url}, ${mant_btn_texto}, ${mant_msg_whatsapp}
                )
            `;
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
