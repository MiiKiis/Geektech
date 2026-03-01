const { neon } = require('@neondatabase/serverless');
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

const sql = neon(process.env.DATABASE_URL);

async function run() {
    console.log('📊 Agregando columna posicion a todas las tablas...');

    await sql`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS posicion INTEGER`;
    await sql`UPDATE componentes_pcs SET posicion = id WHERE posicion IS NULL`;
    console.log('  ✓ componentes_pcs.posicion OK');

    await sql`ALTER TABLE cuentas_streaming ADD COLUMN IF NOT EXISTS posicion INTEGER`;
    await sql`UPDATE cuentas_streaming SET posicion = id WHERE posicion IS NULL`;
    console.log('  ✓ cuentas_streaming.posicion OK');

    // home_game ya tiene posicion, solo aseguramos que los NULL tengan valor
    await sql`UPDATE home_game SET posicion = id WHERE posicion IS NULL`;
    console.log('  ✓ home_game.posicion OK');

    console.log('\n✅ Todo listo. Posiciones iniciales:');
    const c1 = await sql`SELECT id, nombre, posicion FROM componentes_pcs ORDER BY posicion LIMIT 4`;
    console.log('componentes_pcs:', c1.map(r => `#${r.posicion} ${r.nombre}`).join(' | '));
    const c2 = await sql`SELECT id, nombre, posicion FROM cuentas_streaming ORDER BY posicion LIMIT 4`;
    console.log('cuentas_streaming:', c2.map(r => `#${r.posicion} ${r.nombre}`).join(' | '));
    const c3 = await sql`SELECT id, nombre, posicion FROM home_game ORDER BY posicion LIMIT 4`;
    console.log('home_game:', c3.map(r => `#${r.posicion} ${r.nombre}`).join(' | '));
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
