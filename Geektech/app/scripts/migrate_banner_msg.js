const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Adding mant_msg_whatsapp column to banner_config...');
  
  try {
    await sql(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_msg_whatsapp TEXT`);
    
    // Set default
    await sql(`UPDATE banner_config SET 
      mant_msg_whatsapp = COALESCE(mant_msg_whatsapp, 'Hola! Me interesa un mantenimiento para mi PC.')
      WHERE id = 1 OR id = (SELECT id FROM banner_config LIMIT 1)`);
      
    console.log('Column added and default value set.');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  process.exit(0);
}

run();
