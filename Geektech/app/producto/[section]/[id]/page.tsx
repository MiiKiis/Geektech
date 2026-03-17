import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sql } from '@/lib/db';
import PurchaseActions from './PurchaseActions';
import ProductImageGallery from './ProductImageGallery';

type ProductRecord = {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio: string | number | null;
    imagen_url: string | null;
    categoria: string | null;
    tipo?: string | null;
    plataforma?: string | null;
    duracion?: string | null;
    variantes_precio: string | null;
    imagenes_adicionales?: unknown;
    agotado?: boolean | null;
};

const sectionMap = {
    'juegos': {
        table: 'home_game',
        label: 'Juegos',
        backHref: '/',
        backLabel: 'Inicio',
        categoryProjection: 'categoria',
        selectProjection: "NULL::varchar AS tipo, NULL::varchar AS plataforma, NULL::varchar AS duracion",
    },
    'home-game': {
        table: 'home_game',
        label: 'Juegos',
        backHref: '/',
        backLabel: 'Inicio',
        categoryProjection: 'categoria',
        selectProjection: "NULL::varchar AS tipo, NULL::varchar AS plataforma, NULL::varchar AS duracion",
    },
    'tienda': {
        table: 'tienda',
        label: 'Tienda',
        backHref: '/tienda',
        backLabel: 'Tienda',
        categoryProjection: 'categoria',
        selectProjection: "NULL::varchar AS tipo, NULL::varchar AS plataforma, NULL::varchar AS duracion",
    },
    'cuentas-streaming': {
        table: 'cuentas_streaming',
        label: 'Streaming',
        backHref: '/cuentas-streaming',
        backLabel: 'Streaming',
        categoryProjection: 'NULL::varchar AS categoria',
        selectProjection: 'NULL::varchar AS tipo, plataforma, duracion',
    },
    'streaming': {
        table: 'cuentas_streaming',
        label: 'Streaming',
        backHref: '/cuentas-streaming',
        backLabel: 'Streaming',
        categoryProjection: 'NULL::varchar AS categoria',
        selectProjection: 'NULL::varchar AS tipo, plataforma, duracion',
    },
    'mantenimiento-componentes': {
        table: 'componentes_pcs',
        label: 'Mantenimiento y Componentes',
        backHref: '/mantenimiento-componentes',
        backLabel: 'Mantenimiento',
        categoryProjection: 'categoria',
        selectProjection: 'tipo, NULL::varchar AS plataforma, NULL::varchar AS duracion',
    },
} as const;

function getSectionConfig(section: string) {
    return sectionMap[section as keyof typeof sectionMap] ?? null;
}

function normalizeImages(raw: unknown, fallback: string) {
    if (Array.isArray(raw)) {
        return [fallback, ...raw.filter((item): item is string => typeof item === 'string' && item.length > 0)];
    }
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return [fallback, ...parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)];
            }
        } catch {
            return [fallback];
        }
    }
    return [fallback];
}

async function fetchProduct(section: string, id: string): Promise<{ product: ProductRecord; config: NonNullable<ReturnType<typeof getSectionConfig>> } | null> {
    const config = getSectionConfig(section);
    if (!config) return null;

    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return null;

    const rows = await sql.unsafe(
        `SELECT id, nombre, descripcion, precio, imagen_url, ${config.categoryProjection}, ${config.selectProjection}, variantes_precio, imagenes_adicionales, agotado FROM ${config.table} WHERE id = $1 LIMIT 1`,
        [numericId]
    );

    if (!rows.length) return null;
    return { product: rows[0] as unknown as ProductRecord, config };
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; id: string }> }): Promise<Metadata> {
    const { section, id } = await params;
    const result = await fetchProduct(section, id);
    if (!result) {
        return { title: 'Producto no encontrado' };
    }

    return {
        title: `${result.product.nombre} | GeekTech`,
        description: result.product.descripcion ?? `Detalle del producto ${result.product.nombre} en GeekTech.`,
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ section: string; id: string }> }) {
    const { section, id } = await params;
    const result = await fetchProduct(section, id);

    if (!result) {
        notFound();
    }

    const { product, config } = result;
    const coverImage = product.imagen_url || '/img/placeholder.jpg';
    const images = normalizeImages(product.imagenes_adicionales, coverImage);
    const subtitle = product.plataforma
        ? `${product.plataforma}${product.duracion ? ` · ${product.duracion}` : ''}`
        : (product.tipo || product.categoria || config.label);
    const description = product.descripcion || 'Este producto mantiene la misma línea premium de GeekTech y puedes comprarlo o añadirlo al carrito desde esta vista.';
    const priceNumber = product.precio !== null && product.precio !== undefined && product.precio !== ''
        ? Number.parseFloat(String(product.precio))
        : null;

    return (
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <Link href={config.backHref} className="transition hover:text-purple-300">{config.backLabel}</Link>
                <span>/</span>
                <span className="text-purple-300">{product.nombre}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <ProductImageGallery productName={product.nombre} images={images} />

                <section className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-[#141420] p-6 shadow-2xl shadow-black/30 sm:p-8">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                        <span>{config.label}</span>
                        {product.agotado ? <span>Agotado</span> : <span>Disponible</span>}
                    </div>

                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{product.nombre}</h1>
                        <p className="mt-3 text-base text-gray-300 sm:text-lg">{subtitle}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Descripción</p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-200 sm:text-base">{description}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-[#101019] p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Categoría</p>
                            <p className="mt-2 font-semibold text-white">{product.categoria || config.label}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#101019] p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Detalle</p>
                            <p className="mt-2 font-semibold text-white">{subtitle}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#101019] p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Estado</p>
                            <p className={`mt-2 font-semibold ${product.agotado ? 'text-red-400' : 'text-emerald-400'}`}>{product.agotado ? 'Sin stock' : 'Listo para comprar'}</p>
                        </div>
                    </div>

                    <PurchaseActions
                        id={product.id}
                        title={product.nombre}
                        subtitle={subtitle}
                        description={description}
                        image={coverImage}
                        category={config.label}
                        basePrice={priceNumber}
                        variantsRaw={product.variantes_precio}
                        agotado={!!product.agotado}
                    />
                </section>
            </div>
        </main>
    );
}
