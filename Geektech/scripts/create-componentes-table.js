const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

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
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            }
        }
    } catch (e) {
        console.warn('Warning: Could not load .env.local', e.message);
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function updateDB() {
    try {
        console.log('🔧 Actualizando base de datos componentes_pcs...\n');

        // 1. Asegurar que la tabla existe con la columna variantes_precio
        await sql`CREATE TABLE IF NOT EXISTS componentes_pcs (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10, 2),
            imagen_url VARCHAR(500),
            categoria VARCHAR(100),
            tipo VARCHAR(100),
            variantes_precio VARCHAR(1000)
        )`;
        console.log('✅ Tabla verificada');

        // 2. Agregar columna variantes_precio si no existe
        await sql`ALTER TABLE componentes_pcs ADD COLUMN IF NOT EXISTS variantes_precio VARCHAR(1000)`;
        console.log('✅ Columna variantes_precio verificada');

        // 3. Limpiar datos de prueba anteriores
        await sql`DELETE FROM componentes_pcs`;
        console.log('✅ Datos anteriores eliminados\n');

        // 4. Insertar productos - MANTENIMIENTO
        console.log('🛠️  Insertando servicios de Mantenimiento...');

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Mantenimiento Preventivo PC',
                'Limpieza profunda de hardware, cambio de pasta térmica, revisión de cables y componentes',
                25.00,
                '/img/placeholder.jpg',
                'Mantenimiento',
                'Servicio',
                '[{"label":"Básico","value":25},{"label":"Completo","value":45},{"label":"Premium","value":70}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Mantenimiento Preventivo Laptop',
                'Limpieza interna, revisión de ventiladores, cambio de pasta térmica y revisión térmica',
                30.00,
                '/img/placeholder.jpg',
                'Mantenimiento',
                'Servicio',
                '[{"label":"Básico","value":30},{"label":"Completo","value":55},{"label":"Premium con cambio de ventilador","value":90}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Formateo y Reinstalación Windows',
                'Formateo con instalación de Windows 10/11, drivers y programas esenciales',
                20.00,
                '/img/placeholder.jpg',
                'Mantenimiento',
                'Servicio',
                '[{"label":"Windows 10 Home","value":20},{"label":"Windows 11 Home","value":20},{"label":"Windows 11 Pro","value":25}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Eliminación de Virus y Malware',
                'Escaneo profundo, eliminación de virus, malware, spyware y optimización del sistema',
                15.00,
                '/img/placeholder.jpg',
                'Mantenimiento',
                'Servicio',
                '[{"label":"Limpieza básica","value":15},{"label":"Limpieza + optimización","value":25}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Recuperación de Datos',
                'Recuperación de archivos borrados o de disco dañado en PC o Laptop',
                40.00,
                '/img/placeholder.jpg',
                'Mantenimiento',
                'Servicio',
                '[{"label":"Disco en buen estado","value":40},{"label":"Disco con errores leves","value":65},{"label":"Caso complejo","value":100}]'
            )`;

        console.log('  ✓ 5 servicios de Mantenimiento insertados\n');

        // 5. Insertar productos - COMPONENTES
        console.log('⚙️  Insertando Componentes...');

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Memoria RAM DDR4',
                'Memoria RAM de alto rendimiento para PC de escritorio, compatible con la mayoría de motherboards',
                22.00,
                '/img/placeholder.jpg',
                'Componentes',
                'RAM',
                '[{"label":"8GB 3200MHz","value":22},{"label":"16GB 3200MHz","value":42},{"label":"32GB 3200MHz","value":80}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Memoria RAM DDR5',
                'Memoria RAM DDR5 de última generación para PC de alta gama',
                55.00,
                '/img/placeholder.jpg',
                'Componentes',
                'RAM',
                '[{"label":"16GB 4800MHz","value":55},{"label":"32GB 4800MHz","value":105},{"label":"64GB 5200MHz","value":200}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'SSD Kingston SATA',
                'Disco de estado sólido SATA III de 2.5 pulgadas. Mejora el rendimiento de tu PC',
                35.00,
                '/img/placeholder.jpg',
                'Componentes',
                'Almacenamiento',
                '[{"label":"240GB","value":20},{"label":"480GB","value":35},{"label":"960GB","value":60}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'SSD NVMe M.2',
                'Disco NVMe de alta velocidad M.2 PCIe Gen 4, hasta 7000MB/s de lectura',
                45.00,
                '/img/placeholder.jpg',
                'Componentes',
                'Almacenamiento',
                '[{"label":"256GB","value":30},{"label":"512GB","value":45},{"label":"1TB","value":80},{"label":"2TB","value":150}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Disco Duro HDD 3.5"',
                'Disco duro mecánico para almacenamiento masivo de datos en PC de escritorio',
                30.00,
                '/img/placeholder.jpg',
                'Componentes',
                'Almacenamiento',
                '[{"label":"1TB","value":30},{"label":"2TB","value":50},{"label":"4TB","value":90}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Fuente de Poder',
                'Fuente de poder certificada para PC de escritorio, protección contra sobretensión',
                35.00,
                '/img/placeholder.jpg',
                'Componentes',
                'Fuente',
                '[{"label":"500W 80+ Bronze","value":35},{"label":"650W 80+ Bronze","value":50},{"label":"750W 80+ Gold","value":75}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Pasta Térmica Profesional',
                'Pasta térmica de alta conductividad para CPU y GPU. Mejora temperaturas hasta 15°C',
                5.00,
                '/img/placeholder.jpg',
                'Componentes',
                'Accesorios',
                '[{"label":"Básica 1g","value":5},{"label":"Profesional 3g","value":12},{"label":"Noctua NT-H1 3.5g","value":20}]'
            )`;

        console.log('  ✓ 7 Componentes insertados\n');

        // 6. Insertar productos - LAPTOPS
        console.log('💻 Insertando Laptops...');

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Laptop HP 15 - Intel Core i5',
                'Laptop HP con procesador i5 12ma Gen, pantalla FHD 15.6", ideal para trabajo y estudio',
                380.00,
                '/img/placeholder.jpg',
                'Laptops',
                'Laptop',
                '[{"label":"8GB RAM / 256GB SSD","value":380},{"label":"16GB RAM / 512GB SSD","value":480}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Laptop Lenovo IdeaPad - Ryzen 5',
                'Laptop Lenovo con AMD Ryzen 5, pantalla FHD 15.6", excelente relación precio/rendimiento',
                350.00,
                '/img/placeholder.jpg',
                'Laptops',
                'Laptop',
                '[{"label":"8GB RAM / 512GB SSD","value":350},{"label":"16GB RAM / 512GB SSD","value":420}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Laptop ASUS VivoBook - Intel i7',
                'Laptop ASUS con Intel i7 12va Gen, pantalla OLED 14", diseño ultradelgado para profesionales',
                650.00,
                '/img/placeholder.jpg',
                'Laptops',
                'Laptop',
                '[{"label":"16GB RAM / 512GB SSD","value":650},{"label":"16GB RAM / 1TB SSD","value":750}]'
            )`;

        await sql`INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
            VALUES (
                'Laptop Gamer ASUS TUF - RTX 4060',
                'Laptop gaming con RTX 4060, pantalla 144Hz FHD, perfecta para juegos de alta gama',
                900.00,
                '/img/placeholder.jpg',
                'Laptops',
                'Laptop Gamer',
                '[{"label":"16GB RAM / 512GB SSD","value":900},{"label":"32GB RAM / 1TB SSD","value":1100}]'
            )`;

        console.log('  ✓ 4 Laptops insertadas\n');

        // Verificar total
        const count = await sql`SELECT COUNT(*) as total FROM componentes_pcs`;
        console.log(`✅ ¡Base de datos actualizada exitosamente!`);
        console.log(`📦 Total de productos en componentes_pcs: ${count[0].total}`);
        console.log('\nProductos por categoría:');

        const byCategory = await sql`SELECT categoria, COUNT(*) as total FROM componentes_pcs GROUP BY categoria ORDER BY categoria`;
        byCategory.forEach(row => {
            console.log(`  - ${row.categoria}: ${row.total} productos`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateDB();
