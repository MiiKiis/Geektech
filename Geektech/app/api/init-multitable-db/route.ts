import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`DROP TABLE IF EXISTS tabla_creditos, tabla_licencias, tabla_streaming, banners CASCADE`;
    await sql`DROP TABLE IF EXISTS home, tienda, windows_keys, cuentas_streaming, home_game CASCADE`;

    await sql`
            CREATE TABLE IF NOT EXISTS home (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255),
                imagen_url VARCHAR(500) NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                link VARCHAR(500)
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS home_game (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2),
                imagen_url VARCHAR(500),
                categoria VARCHAR(100),
                variantes_precio TEXT
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS tienda (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2),
                imagen_url VARCHAR(500),
                categoria VARCHAR(100),
                variantes_precio VARCHAR(500)
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS windows_keys (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2),
                imagen_url VARCHAR(500),
                tipo VARCHAR(100),
                version VARCHAR(100)
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS cuentas_streaming (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2),
                imagen_url VARCHAR(500),
                duracion VARCHAR(100),
                plataforma VARCHAR(100)
            );
        `;

    const homeCount = await sql`SELECT count(*) FROM home`;
    if (Number(homeCount[0].count) === 0) {
      await sql`
                INSERT INTO home (titulo, imagen_url, active, link) VALUES
                ('Ofertas de Verano', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', TRUE, '#promo'),
                ('Nuevos Lanzamientos', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070&auto=format&fit=crop', TRUE, '#new-releases');
            `;
    }

    const tiendaCount = await sql`SELECT count(*) FROM tienda`;
    if (Number(tiendaCount[0].count) === 0) {
      await sql`
                INSERT INTO tienda (nombre, descripcion, precio, imagen_url, categoria, variantes_precio) VALUES
                ('Black Myth: Wukong', 'Juego de acción RPG.', 60.00, '/img/game/wukong.webp', 'Juegos', 'Steam:60'),
                ('Tekken 8', 'Juego de lucha.', 70.00, '/img/game/tekken-8.webp', 'Juegos', 'Steam:70');
            `;
    }

    const windowsKeysCount = await sql`SELECT count(*) FROM windows_keys`;
    if (Number(windowsKeysCount[0].count) === 0) {
      await sql`
                INSERT INTO windows_keys (nombre, descripcion, precio, imagen_url, tipo, version) VALUES
                ('Windows 10 Pro', 'Licencia digital para Windows 10 Pro.', 15.00, '/img/keys/win10.webp', 'Windows', '10 Pro'),
                ('Windows 11 Pro', 'Licencia digital para Windows 11 Pro.', 20.00, '/img/keys/win11.webp', 'Windows', '11 Pro');
            `;
    }

    const streamingCount = await sql`SELECT count(*) FROM cuentas_streaming`;
    if (Number(streamingCount[0].count) === 0) {
      await sql`
                INSERT INTO cuentas_streaming (nombre, descripcion, precio, imagen_url, duracion, plataforma) VALUES
                ('Netflix 4K', 'Plan Premium Ultra HD', 20.00, '/img/principal/logo.png', '30 Días', 'Netflix'),
                ('Spotify Premium', 'Música sin anuncios', 10.00, '/img/principal/logo.png', '3 Meses', 'Spotify');
            `;
    }

    const homeGameCount = await sql`SELECT count(*) FROM home_game`;
    if (Number(homeGameCount[0].count) === 0) {
      await sql`
                INSERT INTO home_game (nombre, descripcion, precio, imagen_url, categoria, variantes_precio) VALUES
                ('Black Myth: Wukong', 'Juego destacado del mes.', 60.00, '/img/game/wukong.webp', 'Destacado', 'Standard:60, Deluxe:70'),
                ('Minecraft Java & Bedrock', 'El clásico de construcción.', 25.00, '/img/game/hytale.webp', 'Destacado', 'Standard:25');
            `;
    }

    return NextResponse.json({ message: 'Tablas verificadas y datos iniciales listos.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
