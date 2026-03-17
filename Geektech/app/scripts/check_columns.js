const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  try {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'banner_config'`;
    console.log('Columns:', columns.map(c => c.column_name).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
check();
