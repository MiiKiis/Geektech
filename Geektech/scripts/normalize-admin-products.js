const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

function loadDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no encontrado');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split(/\r?\n/).forEach((line) => {
    const sanitized = line.replace(/^\uFEFF/, '').trim();
    if (!sanitized || sanitized.startsWith('#')) return;

    const match = sanitized.match(/^([^=]+)=(.*)$/);
    if (!match) return;

    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envVars[match[1].trim()] = value;
  });

  if (!envVars.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definido en .env.local');
  }

  return envVars.DATABASE_URL;
}

function normalizeVariants(raw) {
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const normalized = parsed
      .map((variant) => ({
        label: String(variant?.label ?? '').trim(),
        value: String(variant?.value ?? '').trim(),
      }))
      .filter((variant) => variant.label.length > 0 && variant.value.length > 0);

    return normalized.length > 0 ? JSON.stringify(normalized) : null;
  } catch {
    return null;
  }
}

function normalizeImages(raw) {
  if (Array.isArray(raw)) {
    return JSON.stringify(raw.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean));
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean));
      }
    } catch {
      return '[]';
    }
  }

  return '[]';
}

function serializeCurrentImages(raw) {
  if (typeof raw === 'string') {
    return raw;
  }

  if (Array.isArray(raw)) {
    return JSON.stringify(raw);
  }

  return '[]';
}

async function normalizeTable(sql, table) {
  const rows = await sql.unsafe(`SELECT id, variantes_precio, imagenes_adicionales FROM ${table}`);
  let updated = 0;

  for (const row of rows) {
    const normalizedVariants = normalizeVariants(row.variantes_precio);
    const normalizedImages = normalizeImages(row.imagenes_adicionales);
    const currentImages = serializeCurrentImages(row.imagenes_adicionales);
    const currentVariants = row.variantes_precio === null || row.variantes_precio === undefined
      ? null
      : String(row.variantes_precio);

    if (normalizedVariants === currentVariants && normalizedImages === currentImages) {
      continue;
    }

    await sql.unsafe(
      `UPDATE ${table} SET variantes_precio = $1, imagenes_adicionales = $2 WHERE id = $3`,
      [normalizedVariants, normalizedImages, row.id]
    );
    updated += 1;
  }

  return { table, scanned: rows.length, updated };
}

async function main() {
  const connectionString = loadDatabaseUrl();
  const sql = postgres(connectionString, { ssl: 'require' });
  const tables = ['home_game', 'componentes_pcs', 'cuentas_streaming'];

  try {
    const results = [];
    for (const table of tables) {
      results.push(await normalizeTable(sql, table));
    }

    console.log('Normalización completada:');
    results.forEach((result) => {
      console.log(`- ${result.table}: ${result.updated} actualizados de ${result.scanned}`);
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error('Error al normalizar productos:', error.message);
  process.exit(1);
});