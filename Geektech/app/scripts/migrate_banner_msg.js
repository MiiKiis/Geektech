const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  
  console.log('Adding mant_msg_whatsapp column to banner_config...');
  
  try {
    await sql.unsafe(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_msg_whatsapp TEXT`);
    
    // Set default
    await sql.unsafe(`UPDATE banner_config SET 
      mant_msg_whatsapp = COALESCE(mant_msg_whatsapp, 'Hola! Me interesa un mantenimiento para mi PC.')
      WHERE id = 1 OR id = (SELECT id FROM banner_config LIMIT 1)`);
      
    console.log('Column added and default value set.');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  process.exit(0);
}

run();
