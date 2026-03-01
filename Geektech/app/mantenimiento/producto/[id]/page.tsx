import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parsePrices } from '../../../lib/price';
import type { Metadata } from 'next';
import VariantSelector from './VariantSelector';

// ── Types ────────────────────────────────────────────────────
interface Componente {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio: string | null;
    imagen_url: string | null;
    categoria: string | null;
    tipo: string | null;
    variantes_precio: string | null;
}

// ── Metadata dinámica ─────────────────────────────────────────
export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProduct(id);
    if (!product) return { title: 'Producto no encontrado | GeekTech' };
    const title = `${product.nombre} | GeekTech Mantenimiento y Tienda`;
    const description = product.descripcion ?? `Compra ${product.nombre} en GeekTech. El mejor servicio técnico y componentes de PC en Bolivia.`;
    const image = product.imagen_url && !product.imagen_url.includes('placeholder') ? product.imagen_url : 'https://geektech.onl/images/og-image.jpg';

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `https://geektech.onl/mantenimiento/producto/${id}`,
            type: 'article',
            images: [{ url: image }],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image],
        }
    };
}

// ── Data fetching (Server Component — Neon direct) ────────────
async function fetchProduct(id: string): Promise<Componente | null> {
    if (!process.env.DATABASE_URL) return null;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
        SELECT id, nombre, descripcion, precio, imagen_url, categoria, tipo, variantes_precio
        FROM componentes_pcs
        WHERE id = ${numericId}
        LIMIT 1
    `;
    return (rows[0] as Componente) ?? null;
}

// ── Page ─────────────────────────────────────────────────────
export default async function ComponenteDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) notFound();

    const variants = parsePrices(product.variantes_precio);
    const basePrice = product.precio ? parseFloat(product.precio) : null;
    const displayPrice = basePrice ?? (variants.length > 0 ? Math.min(...variants.map(v => v.value)) : null);

    const categoryColor: Record<string, string> = {
        'Mantenimiento': '#a78bfa',
        'Componentes': '#10b981',
        'Laptops': '#3b82f6',
        'Accesorios': '#f472b6',
    };
    const accentColor = categoryColor[product.categoria ?? ''] ?? '#8b5cf6';

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f0f12',
            paddingTop: '90px',
            paddingBottom: '60px',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

                {/* ── Breadcrumb ── */}
                <nav style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Inicio</Link>
                    <span>›</span>
                    <Link href="/mantenimiento-componentes" style={{ color: '#6b7280', textDecoration: 'none' }}>Mantenimiento y Tienda</Link>
                    <span>›</span>
                    <span style={{ color: accentColor }}>{product.nombre}</span>
                </nav>

                {/* ── Main grid ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 420px) 1fr',
                    gap: '32px',
                    alignItems: 'start',
                }}>
                    {/* ── LEFT: Image ── */}
                    <div style={{
                        background: '#17171f',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* Glow bg */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `radial-gradient(circle at center, ${accentColor}18 0%, transparent 70%)`,
                        }} />

                        {product.imagen_url && !product.imagen_url.includes('placeholder') ? (
                            <img
                                src={product.imagen_url}
                                alt={product.nombre}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                            />
                        ) : (
                            <span style={{ fontSize: '80px', opacity: 0.25, zIndex: 1 }}>
                                {product.categoria === 'Laptops' ? '💻' : product.categoria === 'Componentes' ? '⚙️' : '🛠️'}
                            </span>
                        )}

                        {/* Type badge */}
                        {product.tipo && (
                            <div style={{
                                position: 'absolute', top: '14px', left: '14px',
                                background: `${accentColor}cc`,
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px', padding: '4px 12px',
                                fontSize: '11px', fontWeight: 700, color: '#fff',
                                letterSpacing: '0.05em', textTransform: 'uppercase',
                            }}>
                                {product.tipo}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Info ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Category tag */}
                        {product.categoria && (
                            <span style={{
                                display: 'inline-block', width: 'fit-content',
                                fontSize: '11px', fontWeight: 700,
                                padding: '4px 12px', borderRadius: '999px',
                                background: `${accentColor}18`,
                                border: `1px solid ${accentColor}40`,
                                color: accentColor,
                                letterSpacing: '0.06em', textTransform: 'uppercase',
                            }}>
                                {product.categoria}
                            </span>
                        )}

                        {/* Title */}
                        <h1 style={{
                            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                            fontWeight: 800, color: '#fff',
                            lineHeight: 1.2, margin: 0,
                        }}>
                            {product.nombre}
                        </h1>

                        {/* Description */}
                        {product.descripcion ? (
                            <p style={{
                                fontSize: '15px', color: '#94a3b8',
                                lineHeight: 1.8, margin: 0,
                                padding: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                            }}>
                                {product.descripcion}
                            </p>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#4b5563', fontStyle: 'italic' }}>
                                Sin descripción disponible.
                            </p>
                        )}

                        {/* Variant selector + WhatsApp — Client Component */}
                        <VariantSelector
                            productName={product.nombre}
                            productCategory={product.categoria}
                            variants={variants}
                            basePrice={displayPrice}
                            accentColor={accentColor}
                        />

                        {/* Back button */}
                        <Link href="/mantenimiento-componentes" style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#9ca3af', fontWeight: 500, fontSize: '14px',
                            borderRadius: '12px', textDecoration: 'none',
                        }}>
                            ← Volver al catálogo de mantenimiento
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 700px) {
                    div[style*="grid-template-columns: minmax(280px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
