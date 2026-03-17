const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            for (const line of envContent.split('\n')) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            }
        }
    } catch (e) {
        console.warn('Warning: .env.local no encontrado', e.message);
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no encontrada');
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function limpiarTienda() {
    try {
        // Ver cuántos registros hay antes
        const antes = await sql`SELECT COUNT(*) as total FROM tienda`;
        console.log(`📦 Registros actuales en tienda: ${antes[0].total}`);

        if (parseInt(antes[0].total) === 0) {
            console.log('ℹ️  La tabla ya está vacía. Nada que borrar.');
            return;
        }

        // Vaciar la tabla
        await sql`TRUNCATE TABLE tienda RESTART IDENTITY`;

        // Verificar
        const despues = await sql`SELECT COUNT(*) as total FROM tienda`;
        console.log(`✅ Tabla "tienda" vaciada. Registros restantes: ${despues[0].total}`);
        console.log('\n💡 La estructura de la tabla se conservó.');
        console.log('   Si quieres eliminarla por completo, ejecuta manualmente:');
        console.log('   DROP TABLE tienda;');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

limpiarTienda();
