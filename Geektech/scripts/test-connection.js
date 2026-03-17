const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// 1. Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('🔄 Checking .env.local at:', envPath);

if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file NOT FOUND!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
    const sanitized = line.replace(/^\uFEFF/, '').trim();
    if (!sanitized || sanitized.startsWith('#')) return;
    const match = sanitized.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envVars[match[1].trim()] = value;
    }
});

const poolerConnectionString = (envVars.DATABASE_URL_POOLER || '').trim();
const directConnectionString = (envVars.DATABASE_URL || '').trim();
const connectionString = poolerConnectionString || directConnectionString;

if (!connectionString) {
    console.error('❌ DATABASE_URL or DATABASE_URL_POOLER is NOT defined in .env.local');
    console.log('Found variables:', Object.keys(envVars));
    process.exit(1);
}

console.log('✅ DB URL found (starts with):', connectionString.substring(0, 15) + '...');

// 2. Test Connection
async function testConnection() {
    console.log('🔄 Attempting to connect to Supabase PostgreSQL...');
    const sql = postgres(connectionString, { ssl: 'require' });
    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Connection SUCCESSFUL!');
        console.log('📊 Database Version:', result[0].version);
    } catch (error) {
        console.error('❌ Connection FAILED:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (
            error.code === 'ETIMEDOUT' &&
            connectionString.includes('db.') &&
            connectionString.includes('.supabase.co:5432')
        ) {
            console.error('💡 Tip: this looks like Supabase direct DB over IPv6 (db.*:5432).');
            console.error('💡 If your network has no IPv6 route, use Supabase Session Pooler (IPv4) URL on port 6543.');
            console.error('💡 Save it as DATABASE_URL_POOLER in .env.local and retry.');
        }
    } finally {
        await sql.end({ timeout: 5 });
    }
}

testConnection();
