const postgres = require('postgres');
const fs = require('fs'), path = require('path');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        if (fs.existsSync(envPath)) {
            fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
                const m = l.match(/^([^=]+)=(.*)$/);
                if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
            });
        }
    } catch (e) { console.warn('Warning:', e.message); }
}
loadEnv();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
    console.log('🎨 Creando tabla banner_config...');

    await sql`
        CREATE TABLE IF NOT EXISTS banner_config (
            id          SERIAL PRIMARY KEY,
            titulo      TEXT NOT NULL DEFAULT 'Productos Digitales',
            subtitulo   TEXT DEFAULT 'Eleva tu experiencia gamer con nuestra selección premium.',
            btn_texto   TEXT DEFAULT 'Ver Productos',
            btn_link    TEXT DEFAULT '/mantenimiento-componentes',
            imagen_url  TEXT DEFAULT '/img/principal/banner.svg',
            badge1_icon TEXT DEFAULT '🚀',
            badge1_text TEXT DEFAULT 'Rápido',
            badge2_icon TEXT DEFAULT '⚡',
            badge2_text TEXT DEFAULT 'Entrega Inmediata',
            activo      BOOLEAN DEFAULT true,
            updated_at  TIMESTAMP DEFAULT NOW()
        )
    `;

    // Insertar configuración por defecto si está vacía
    const existing = await sql`SELECT COUNT(*) as c FROM banner_config`;
    if (parseInt(existing[0].c) === 0) {
        await sql`
            INSERT INTO banner_config (titulo, subtitulo, btn_texto, btn_link, imagen_url, badge1_icon, badge1_text, badge2_icon, badge2_text)
            VALUES (
                'Productos Digitales Sin Límites',
                'Eleva tu experiencia gamer con nuestra selección premium de software y complementos.',
                'Ver Productos',
                '/mantenimiento-componentes',
                '/img/principal/banner.svg',
                '🚀', 'Rápido',
                '⚡', 'Entrega Inmediata'
            )
        `;
        console.log('  ✓ Configuración por defecto insertada');
    } else {
        console.log('  ✓ Tabla ya tenía datos');
    }

    const data = await sql`SELECT * FROM banner_config LIMIT 1`;
    console.log('\n✅ Banner config actual:');
    console.log('  Título:', data[0].titulo);
    console.log('  Subtítulo:', data[0].subtitulo);
    console.log('  Botón:', data[0].btn_texto, '→', data[0].btn_link);
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
