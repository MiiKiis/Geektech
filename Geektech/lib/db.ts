import postgres from 'postgres';

// Usamos la URL de la base de datos de Docker si existe, si no, probamos con una local para desarrollo
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password_segura_aqui@localhost:5432/geektech_db';

export const sql = postgres(connectionString, {
    max: 10, // Límite de conexiones para no saturar los 256M de RAM del contenedor de PostgreSQL
});

export default sql;
