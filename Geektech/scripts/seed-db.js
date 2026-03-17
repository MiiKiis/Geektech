
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment or .env.local');
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

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
            await sql.unsafe(statement);
        }

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();

