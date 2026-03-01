const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            for (const line of envContent.split('\n')) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            }
        }
    } catch (e) {
        console.warn('Warning: .env.local no encontrado');
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no encontrada');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seed() {
    try {
        console.log('🖱️  Insertando Accesorios...');

        const accesorios = [
            {
                nombre: 'Mouse Gamer RGB',
                descripcion: 'Mouse gaming con sensor óptico de alta precisión, 7 botones programables e iluminación RGB personalizable.',
                precio: 18.00, tipo: 'Mouse',
                variantes: '[{"label":"800 DPI básico","value":18},{"label":"3200 DPI Pro","value":28},{"label":"6400 DPI Elite","value":45}]'
            },
            {
                nombre: 'Teclado Mecánico Gaming',
                descripcion: 'Teclado mecánico con switches Blue/Red, retroiluminación RGB y anti-ghosting completo para gaming.',
                precio: 35.00, tipo: 'Teclado',
                variantes: '[{"label":"Switches Blue TKL","value":35},{"label":"Switches Red Full","value":45},{"label":"Switches Brown Wireless","value":65}]'
            },
            {
                nombre: 'Audífonos Gaming 7.1',
                descripcion: 'Audífonos con sonido surround 7.1 virtual, micrófono cancelador de ruido y almohadillas de memory foam.',
                precio: 25.00, tipo: 'Audífonos',
                variantes: '[{"label":"Stereo básico","value":25},{"label":"7.1 Surround","value":40},{"label":"Wireless 7.1","value":60}]'
            },
            {
                nombre: 'Mousepad XL Gaming',
                descripcion: 'Mousepad extendido con superficie optimizada para alta y baja sensibilidad. Base antideslizante de goma.',
                precio: 12.00, tipo: 'Mousepad',
                variantes: '[{"label":"M 30x25cm","value":12},{"label":"XL 60x30cm","value":18},{"label":"XXL 90x40cm","value":25}]'
            },
            {
                nombre: 'Webcam HD 1080p',
                descripcion: 'Cámara web Full HD 1080p con micrófono integrado, corrección automática de luz y soporte universal para monitor.',
                precio: 22.00, tipo: 'Webcam',
                variantes: '[{"label":"720p básica","value":15},{"label":"1080p Full HD","value":22},{"label":"1080p 60fps","value":35}]'
            },
            {
                nombre: 'Hub USB 3.0 Multipuertos',
                descripcion: 'Concentrador USB 3.0 de múltiples puertos con carga rápida, compatible con PC, laptop y Mac.',
                precio: 8.00, tipo: 'Hub',
                variantes: '[{"label":"USB 2.0 4P","value":8},{"label":"USB 3.0 4P","value":14},{"label":"USB 3.0 7P + carga","value":22}]'
            },
            {
                nombre: 'Silla Gamer Ergonómica',
                descripcion: 'Silla gaming ergonómica con soporte lumbar ajustable, reposacabezas y altura regulable. Capacidad hasta 120kg.',
                precio: 120.00, tipo: 'Silla',
                variantes: '[{"label":"Básica","value":120},{"label":"Pro con masaje lumbar","value":180}]'
            },
        ];

        for (const acc of accesorios) {
            await sql`
                INSERT INTO componentes_pcs (nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio)
                VALUES (${acc.nombre}, ${acc.descripcion}, ${acc.precio}, '/img/placeholder.jpg', 'Accesorios', ${acc.tipo}, ${acc.variantes})
            `;
        }

        console.log(`  ✓ ${accesorios.length} accesorios insertados\n`);

        // Resumen final
        const stats = await sql`SELECT categoria, COUNT(*) as total FROM componentes_pcs GROUP BY categoria ORDER BY categoria`;
        console.log('📦 Total por categoría:');
        stats.forEach(r => console.log(`  - ${r.categoria}: ${r.total} productos`));

        const total = await sql`SELECT COUNT(*) as total FROM componentes_pcs`;
        console.log(`\n✅ Total en la tabla: ${total[0].total} productos`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
