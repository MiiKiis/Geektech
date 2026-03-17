import postgres from 'postgres';

const poolerConnectionString = process.env.DATABASE_URL_POOLER?.trim();
const directConnectionString = process.env.DATABASE_URL?.trim();
const connectionString = poolerConnectionString || directConnectionString;

if (!connectionString) {
    throw new Error(
        'DATABASE_URL/DATABASE_URL_POOLER is not defined. Please check your .env.local file or Vercel project settings.'
    );
}

const globalForDb = globalThis as unknown as {
    sql?: ReturnType<typeof postgres>;
};

export const sql =
    globalForDb.sql ??
    postgres(connectionString, {
        ssl: 'require',
    });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.sql = sql;
}

export default sql;

