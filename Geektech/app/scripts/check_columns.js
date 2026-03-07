const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'banner_config'`;
    console.log('Columns:', columns.map(c => c.column_name).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
check();
