'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { parsePrices, mostrarPrecio } from '../lib/price';

interface SearchResult {
    id: string | number;
    nombre: string;
    imagen_url: string;
    category: string;
    subcategory: string;
    link: string;
    price: number | null;
}

const categoryColors: Record<string, string> = {
    'Juegos': '#a855f7', 'Tienda': '#8b5cf6',
    'Software & Licencias': '#3b82f6', 'Streaming': '#22c55e',
    'Mantenimiento': '#f59e0b', 'Componentes': '#10b981', 'Laptops': '#ef4444',
    'PC & Componentes': '#f59e0b',
};
const categoryIcons: Record<string, string> = {
    'Juegos': '🎮', 'Tienda': '🛒',
    'Software & Licencias': '💻', 'Streaming': '📺',
    'Mantenimiento': '🛠️', 'Componentes': '⚙️', 'Laptops': '💻',
    'PC & Componentes': '🛠️',
};

const CATEGORIES = [
    { key: 'all', label: 'Todo', icon: '🗂️', color: '#8b5cf6' },
    { key: 'Mantenimiento', label: 'Mantenimiento', icon: '🛠️', color: '#a78bfa' },
    { key: 'Componentes', label: 'Componentes', icon: '⚙️', color: '#10b981' },
    { key: 'Laptops', label: 'Laptops', icon: '💻', color: '#3b82f6' },
    { key: 'Accesorios', label: 'Accesorios', icon: '🖱️', color: '#f472b6' },
];

function MantenimientoContent() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [globalResults, setGlobalResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) setSearchQuery(query);
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products/mantenimiento-componentes');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data.map((item: any) => ({ ...item, server_info: item.categoria })));
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const doGlobalSearch = useCallback(async (term: string) => {
        if (term.trim().length < 2) {
            setGlobalResults([]);
            setShowDropdown(false);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setGlobalResults(data);
            setShowDropdown(true);
        } catch {
            setGlobalResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doGlobalSearch(val), 350);
    };

    const handleResultClick = (result: SearchResult) => {
        setShowDropdown(false);
        setSearchQuery('');
        router.push(`${result.link}?search=${encodeURIComponent(result.nombre)}`);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setGlobalResults([]);
        setShowDropdown(false);
    };

    const grouped = globalResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {});

    const filteredProducts = products.filter(p => {
        const matchCat = activeCategory === 'all' || p.categoria === activeCategory || p.tipo === activeCategory || p.server_info === activeCategory;
        if (!matchCat) return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return p.nombre.toLowerCase().includes(q) || (p.server_info && p.server_info.toLowerCase().includes(q));
        }
        return true;
    });

    // Productos destacados (primeros 3)
    const featured = products.slice(0, 3);

    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '40px', background: '#0f0f12' }}>

            {/* ===== HERO BANNER ===== */}
            <div style={{
                margin: '0 0 0 0',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                padding: '0',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    maxWidth: '1400px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    minHeight: '320px', gap: '0',
                }} className="hero-grid">
                    {/* Left: promo text */}
                    <div style={{
                        padding: '48px 40px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '999px', padding: '4px 16px', marginBottom: '20px',
                            width: 'fit-content',
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                🛠️ Servicio Profesional
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800,
                            color: '#fff', lineHeight: 1.2, marginBottom: '12px',
                        }}>
                            Mantenimiento &<br />
                            <span style={{ color: '#8b5cf6' }}>Componentes PC</span>
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '28px', maxWidth: '380px', lineHeight: 1.6 }}>
                            Servicio técnico especializado, componentes de calidad y laptops al mejor precio en Bolivia.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setActiveCategory('Mantenimiento')}
                                style={{
                                    background: '#8b5cf6', color: '#fff', fontWeight: 700,
                                    border: 'none', borderRadius: '10px', padding: '12px 24px',
                                    cursor: 'pointer', fontSize: '14px', transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                Ver Servicios
                            </button>
                            <button
                                onClick={() => setActiveCategory('Componentes')}
                                style={{
                                    background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600,
                                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                                    padding: '12px 24px', cursor: 'pointer', fontSize: '14px',
                                }}
                            >
                                Ver Componentes
                            </button>
                        </div>
                    </div>

                    {/* Right: featured product cards horizontal scroll */}
                    <div style={{
                        padding: '32px 24px 32px 0',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        overflowX: 'auto', scrollbarWidth: 'none',
                    }}>
                        {loading ? (
                            <div style={{ color: '#6b7280', fontSize: '14px', padding: '20px' }}>Cargando...</div>
                        ) : featured.length === 0 ? (
                            <div style={{ color: '#6b7280', fontSize: '14px', padding: '20px' }}>Sin productos aún</div>
                        ) : featured.map((p: any) => (
                            <div key={p.id} style={{
                                minWidth: '170px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                                padding: '16px', flexShrink: 0, cursor: 'pointer',
                                transition: 'transform 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                <div style={{
                                    width: '100%', height: '100px', borderRadius: '10px',
                                    background: '#1a1a2e', overflow: 'hidden', marginBottom: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <img src={p.imagen_url || '/img/placeholder.jpg'} alt={p.nombre}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg'; }}
                                    />
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{p.categoria}</div>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#8b5cf6' }}>
                                    Bs {parseFloat(p.precio || '0').toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>

                {/* ===== CATEGORÍAS RÁPIDAS ===== */}
                <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Explorar por categoría</h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                                    border: activeCategory === cat.key
                                        ? `2px solid ${cat.color}`
                                        : '2px solid rgba(255,255,255,0.08)',
                                    background: activeCategory === cat.key
                                        ? `${cat.color}20`
                                        : 'rgba(255,255,255,0.04)',
                                    color: activeCategory === cat.key ? cat.color : '#9ca3af',
                                    fontWeight: activeCategory === cat.key ? 700 : 500,
                                    fontSize: '14px', transition: 'all 0.2s',
                                }}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== BARRA DE BÚSQUEDA Y CONTROLES ===== */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                    alignItems: 'center', gap: '16px', marginBottom: '24px',
                    padding: '16px 20px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                            {activeCategory === 'all' ? 'Todos los productos' : activeCategory}
                        </h2>
                        <span style={{
                            fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '9999px',
                            background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)'
                        }}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Buscador global */}
                        <div style={{ position: 'relative' }} ref={searchContainerRef}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6b7280', pointerEvents: 'none' }}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
                                    onFocus={() => { if (globalResults.length > 0) setShowDropdown(true); }}
                                    autoComplete="off"
                                    style={{
                                        width: '100%', minWidth: '220px', background: '#1e1e24',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                        padding: '9px 36px 9px 36px', fontSize: '14px', color: '#fff',
                                        outline: 'none',
                                    }}
                                />
                                {searchQuery.length > 0 && (
                                    <button onClick={clearSearch} style={{
                                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                                    }}>
                                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                    minWidth: '340px', maxHeight: '400px', overflowY: 'auto',
                                    background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 9999,
                                }}>
                                    {isSearching ? (
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', border: '3px solid rgba(245,158,11,0.3)', borderTop: '3px solid #f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                                            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Buscando...</span>
                                        </div>
                                    ) : globalResults.length === 0 ? (
                                        <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>No se encontraron resultados</p>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '8px 0' }}>
                                            {Object.entries(grouped).map(([category, items]) => (
                                                <div key={category}>
                                                    <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '13px' }}>{categoryIcons[category] || '📦'}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: categoryColors[category] || '#9ca3af' }}>{category}</span>
                                                    </div>
                                                    {items.map((item) => (
                                                        <button key={item.id} onClick={() => handleResultClick(item)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f12' }}>
                                                                <img src={item.imagen_url || '/img/placeholder.jpg'} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                                                                <div style={{ color: '#6b7280', fontSize: '11px' }}>{item.subcategory}</div>
                                                            </div>
                                                            {item.price !== null && item.price > 0 && (
                                                                <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>Bs {item.price.toFixed(2)}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Toggle grid/list */}
                        <div style={{ display: 'flex', background: '#1e1e24', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <button onClick={() => setViewMode('grid')}
                                style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'rgba(139,92,246,0.2)' : 'transparent', color: viewMode === 'grid' ? '#8b5cf6' : '#6b7280', transition: 'all 0.2s' }}>
                                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button onClick={() => setViewMode('list')}
                                style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'rgba(139,92,246,0.2)' : 'transparent', color: viewMode === 'list' ? '#8b5cf6' : '#6b7280', transition: 'all 0.2s' }}>
                                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== GRID DE PRODUCTOS ===== */}
                <main>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                            <div style={{ width: '48px', height: '48px', border: '4px solid rgba(139,92,246,0.2)', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full'
                            : 'flex flex-col gap-4 w-full max-w-5xl mx-auto'
                        }>
                            {filteredProducts.map(p => (
                                <Link
                                    key={p.id}
                                    href={`/mantenimiento/producto/${p.id}`}
                                    style={{ textDecoration: 'none', display: 'block' }}
                                >
                                    <ProductCard product={{
                                        id: p.id, title: p.nombre, subtitle: p.server_info,
                                        img: p.imagen_url || '/img/placeholder.jpg', price: mostrarPrecio(p),
                                        prices: parsePrices(p.variantes_precio), genre: p.categoria
                                    }} viewMode={viewMode} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }}>
                            <div style={{ background: '#1e1e24', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '360px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Sin productos</h3>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                    {activeCategory !== 'all'
                                        ? `Aún no hay productos en ${activeCategory}. Prueba otra categoría.`
                                        : 'No hay productos que coincidan con tu búsqueda.'}
                                </p>
                                {activeCategory !== 'all' && (
                                    <button onClick={() => setActiveCategory('all')} style={{
                                        marginTop: '16px', background: '#8b5cf6', color: '#fff',
                                        border: 'none', borderRadius: '8px', padding: '8px 20px',
                                        fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                                    }}>Ver todos</button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .hero-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export default function MantenimientoComponentesPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div style={{ width: '48px', height: '48px', border: '4px solid rgba(139,92,246,0.2)', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
            <MantenimientoContent />
        </Suspense>
    );
}
