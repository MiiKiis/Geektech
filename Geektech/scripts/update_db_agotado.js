require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runSQL() {
    try {
        console.log("Alterando tablas para agregar agotado...");
        
        await sql`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT false`;
        await sql`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT false`;
        await sql`ALTER TABLE cuentas_streaming ADD COLUMN IF NOT EXISTS agotado BOOLEAN DEFAULT false`;

        console.log("✅ Columna agotado añadida correctamente");
    } catch(e) {
        console.error("❌ Error", e);
    }
}

runSQL();
