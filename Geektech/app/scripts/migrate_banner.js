const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  
  console.log('Adding maintenance banner columns to banner_config...');
  
  try {
    await sql.unsafe(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_titulo TEXT`);
    await sql.unsafe(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_subtitulo TEXT`);
    await sql.unsafe(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_imagen_url TEXT`);
    await sql.unsafe(`ALTER TABLE banner_config ADD COLUMN IF NOT EXISTS mant_btn_texto TEXT`);
    
    // Set some defaults if empty
    await sql.unsafe(`UPDATE banner_config SET 
      mant_titulo = COALESCE(mant_titulo, 'Mantenimiento Profesional de PC'),
      mant_subtitulo = COALESCE(mant_subtitulo, 'Optimiza tu equipo con limpieza profunda, cambio de pasta térmica, gestión de cables y actualización de controladores. Prolonga la vida de tu hardware con los expertos.'),
      mant_imagen_url = COALESCE(mant_imagen_url, '/pc_maintenance_service_banner_1772868547157.png'),
      mant_btn_texto = COALESCE(mant_btn_texto, 'AGENDAR CITA')
      WHERE id = 1 OR id = (SELECT id FROM banner_config LIMIT 1)`);
      
    console.log('Columns added and default values set.');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  process.exit(0);
}

run();
