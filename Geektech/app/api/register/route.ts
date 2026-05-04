import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
        }

        // Verificar si el usuario ya existe
        const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existingUsers.length > 0) {
            return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 400 });
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name}, ${email}, ${hashedPassword}, 'user')
        `;

        return NextResponse.json({ message: 'Usuario creado correctamente.' });
    } catch (error: any) {
        console.error("Error en registro:", error);
        return NextResponse.json({ error: 'Fallo al procesar el registro.' }, { status: 500 });
    }
}
