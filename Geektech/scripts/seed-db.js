
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load environment variables manually since dotenv is not installed
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Warning: Could not load .env.local', e.message);
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment or .env.local');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seed() {
    try {
        console.log('🌱 Seeding database from schema.sql...');

        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Simple split by semicolons to execute statements individually
        const statements = schemaSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await sql([statement]);
        }

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();

