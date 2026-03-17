const path = require('path');
const dotenv = require('dotenv');
const postgres = require('postgres');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no configurada');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function ensureBaseTables() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS home (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255),
      imagen_url VARCHAR(500) NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      link VARCHAR(500)
    )
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS home_game (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2),
      imagen_url VARCHAR(500),
      categoria VARCHAR(100),
      variantes_precio TEXT,
      posicion INTEGER,
      destacado BOOLEAN DEFAULT FALSE,
      agotado BOOLEAN DEFAULT FALSE,
      imagenes_adicionales JSONB DEFAULT '[]'::jsonb
    )
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS cuentas_streaming (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2),
      imagen_url VARCHAR(500),
      duracion VARCHAR(100),
      plataforma VARCHAR(100),
      variantes_precio TEXT,
      posicion INTEGER,
      destacado BOOLEAN DEFAULT FALSE,
      agotado BOOLEAN DEFAULT FALSE,
      imagenes_adicionales JSONB DEFAULT '[]'::jsonb
    )
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS componentes_pcs (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2),
      imagen_url VARCHAR(500),
      categoria VARCHAR(100),
      tipo VARCHAR(100),
      variantes_precio VARCHAR(1000),
      posicion INTEGER,
      destacado BOOLEAN DEFAULT FALSE,
      agotado BOOLEAN DEFAULT FALSE,
      imagenes_adicionales JSONB DEFAULT '[]'::jsonb
    )
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS tienda (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2),
      imagen_url VARCHAR(500),
      categoria VARCHAR(100),
      variantes_precio VARCHAR(1000),
      posicion INTEGER,
      destacado BOOLEAN DEFAULT FALSE,
      agotado BOOLEAN DEFAULT FALSE,
      imagenes_adicionales JSONB DEFAULT '[]'::jsonb
    )
  `);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS banner_config (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL DEFAULT 'Productos Digitales Sin Límites',
      subtitulo TEXT DEFAULT 'Eleva tu experiencia gamer con nuestra selección premium de software y complementos.',
      btn_texto TEXT DEFAULT 'Ver Productos',
      btn_link TEXT DEFAULT '/mantenimiento-componentes',
      imagen_url TEXT DEFAULT '/img/principal/banner.svg',
      badge1_icon TEXT DEFAULT '🚀',
      badge1_text TEXT DEFAULT 'Rápido',
      badge2_icon TEXT DEFAULT '⚡',
      badge2_text TEXT DEFAULT 'Entrega Inmediata',
      mant_titulo TEXT DEFAULT 'Mantenimiento Profesional de PC',
      mant_subtitulo TEXT DEFAULT 'Optimiza tu equipo con limpieza profunda, cambio de pasta térmica, gestión de cables y actualización de controladores.',
      mant_imagen_url TEXT DEFAULT '/pc_maintenance_service_banner_1772868547157.png',
      mant_btn_texto TEXT DEFAULT 'AGENDAR CITA',
      mant_msg_whatsapp TEXT DEFAULT 'Hola! Me interesa un mantenimiento para mi PC.',
      activo BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Asegurar columnas comunes para evitar errores por esquemas antiguos
  await sql.unsafe(`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS tipo VARCHAR(100)`);
  await sql.unsafe(`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS plataforma VARCHAR(100)`);
  await sql.unsafe(`ALTER TABLE home_game ADD COLUMN IF NOT EXISTS duracion VARCHAR(100)`);

  await sql.unsafe(`ALTER TABLE cuentas_streaming ADD COLUMN IF NOT EXISTS tipo VARCHAR(100)`);

  await sql.unsafe(`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS plataforma VARCHAR(100)`);
  await sql.unsafe(`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS duracion VARCHAR(100)`);

  await sql.unsafe(`ALTER TABLE tienda ADD COLUMN IF NOT EXISTS tipo VARCHAR(100)`);
  await sql.unsafe(`ALTER TABLE tienda ADD COLUMN IF NOT EXISTS plataforma VARCHAR(100)`);
  await sql.unsafe(`ALTER TABLE tienda ADD COLUMN IF NOT EXISTS duracion VARCHAR(100)`);
}

async function seedIfEmpty() {
  const homeGameCount = await sql`SELECT COUNT(*)::int AS total FROM home_game`;
  if (homeGameCount[0].total === 0) {
    await sql`
      INSERT INTO home_game (nombre, descripcion, precio, imagen_url, categoria, variantes_precio, posicion, destacado, imagenes_adicionales)
      VALUES (
        'Black Myth: Wukong',
        'Juego destacado del mes con entrega digital y soporte para activación. Incluye galería adicional para probar la nueva ficha de producto.',
        60.00,
        '/img/game/wukong.webp',
        'Destacado',
        'Standard:60, Deluxe:70',
        1,
        true,
        ${JSON.stringify(['/img/game/wukong.webp', '/img/game/tekken-8.webp'])}
      )
    `;
  }

  const streamingCount = await sql`SELECT COUNT(*)::int AS total FROM cuentas_streaming`;
  if (streamingCount[0].total === 0) {
    await sql`
      INSERT INTO cuentas_streaming (nombre, descripcion, precio, imagen_url, duracion, plataforma, posicion, destacado, imagenes_adicionales)
      VALUES (
        'Netflix Premium 4K',
        'Cuenta premium con acceso 4K y activación inmediata. Perfecta para verificar la vista de detalle de streaming.',
        20.00,
        '/img/principal/logo.png',
        '30 Días',
        'Netflix',
        1,
        true,
        ${JSON.stringify(['/img/principal/logo.png'])}
      )
    `;
  }

  const componentesCount = await sql`SELECT COUNT(*)::int AS total FROM componentes_pcs`;
  if (componentesCount[0].total === 0) {
    await sql`
      INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio, posicion, destacado, imagenes_adicionales)
      VALUES (
        'Mantenimiento Preventivo PC',
        'Limpieza profunda, cambio de pasta térmica y optimización general. Se deja como producto visible de ejemplo para validar la ficha completa.',
        25.00,
        '/img/placeholder.jpg',
        'Mantenimiento',
        'Servicio',
        '[{"label":"Básico","value":25},{"label":"Completo","value":45}]',
        1,
        true,
        ${JSON.stringify(['/img/placeholder.jpg'])}
      )
    `;
  }

  const bannerCount = await sql`SELECT COUNT(*)::int AS total FROM banner_config`;
  if (bannerCount[0].total === 0) {
    await sql`
      INSERT INTO banner_config (titulo, subtitulo, btn_texto, btn_link, imagen_url, badge1_icon, badge1_text, badge2_icon, badge2_text)
      VALUES (
        'Productos Digitales Sin Límites',
        'Activa software, compra cuentas premium y gestiona servicios especializados desde un solo lugar.',
        'Ver Productos',
        '/mantenimiento-componentes',
        '/img/principal/banner.svg',
        '🚀', 'Rápido', '⚡', 'Entrega Inmediata'
      )
    `;
  }
}

async function createIndexes() {
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_home_game_order ON home_game (destacado DESC, posicion ASC, id ASC)`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_componentes_order ON componentes_pcs (destacado DESC, posicion ASC, id ASC)`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_streaming_order ON cuentas_streaming (destacado DESC, posicion ASC, id ASC)`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_home_game_nombre ON home_game (LOWER(nombre))`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_componentes_nombre ON componentes_pcs (LOWER(nombre))`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_streaming_nombre ON cuentas_streaming (LOWER(nombre))`);
}

async function main() {
  try {
    console.log('Creando estructura base...');
    await ensureBaseTables();
    console.log('Insertando productos mínimos de ejemplo...');
    await seedIfEmpty();
    console.log('Creando índices...');
    await createIndexes();

    const sample = await sql`SELECT id, nombre, precio, imagen_url FROM home_game ORDER BY id ASC LIMIT 1`;
    console.log('Producto ejemplo:', sample[0]);
    console.log('Bootstrap completado.');
  } catch (error) {
    console.error('Error en bootstrap:', error);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
