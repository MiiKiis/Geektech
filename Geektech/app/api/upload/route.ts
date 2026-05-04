import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Tipos de archivo permitidos para evitar subida de scripts (.php, .sh, etc.)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// Límite de 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export async function POST(request: Request) {
  try {
    // 1. Verificación de Seguridad Básica (Previene acceso público al endpoint)
    const authHeader = request.headers.get('authorization');
    const secretToken = process.env.ADMIN_SECRET_TOKEN;
    
    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // 2. Validación de Seguridad del Archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo excede los 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Escribe en public/uploads que Docker mapeará a tu carpeta uploads física
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3. Sanitización de nombre de archivo
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ 
        message: 'Archivo subido correctamente', 
        url: `/uploads/${uniqueName}` 
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json({ error: 'Fallo al procesar archivo' }, { status: 500 });
  }
}
