const bcrypt = require('bcryptjs');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || "postgres://postgres:password_segura_aqui@localhost:5432/geektech_db");

async function createAdmin() {
    try {
        const name = "miikiis";
        const email = "crisjafeth16@gmail.com"; 
        const password = "Yafetharuquipa12.";
        const role = "admin";

        console.log("Hasheando password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Insertando en la base de datos...");
        await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${role})
            ON CONFLICT (email) DO UPDATE SET 
                password = ${hashedPassword},
                role = ${role}
        `;

        console.log("¡ÉXITO! Cuenta 'miikiis' creada como ADMIN.");
        process.exit(0);
    } catch (error) {
        console.error("Error creando admin:", error);
        process.exit(1);
    }
}

createAdmin();
