require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function runSQL() {
    try {
        console.log("Alterando tablas para agregar imagenes_adicionales y destacado...");
        
        await sql`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS imagenes_adicionales JSONB DEFAULT '[]'::jsonb`;
        await sql`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false`;

        await sql`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS imagenes_adicionales JSONB DEFAULT '[]'::jsonb`;
        await sql`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false`;

        await sql`ALTER TABLE cuentas_streaming ADD COLUMN IF NOT EXISTS imagenes_adicionales JSONB DEFAULT '[]'::jsonb`;
        await sql`ALTER TABLE cuentas_streaming ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false`;

        console.log("✅ Columnas añadidas correctamente");
    } catch(e) {
        console.error("❌ Error", e);
    }
}

runSQL();
