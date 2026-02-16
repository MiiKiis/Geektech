'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
};
const categoryIcons: Record<string, string> = {
    'Juegos': '🎮', 'Tienda': '🛒',
    'Software & Licencias': '💻', 'Streaming': '📺',
};

function TiendaContent() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterServer, setFilterServer] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Global search
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
                const res = await fetch('/api/products/tienda');
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

    // Close dropdown on click outside
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

    const uniqueServers = Array.from(new Set(products.map(p => p.server_info))).filter(Boolean);

    const filteredProducts = products.filter(p => {
        if (filterServer !== 'all' && p.server_info !== filterServer) return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return p.nombre.toLowerCase().includes(q) || (p.server_info && p.server_info.toLowerCase().includes(q));
        }
        return true;
    });

    // parsePrices and mostrarPrecio provided by shared utility

    return (
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 min-h-screen" style={{ paddingTop: '100px', paddingBottom: '32px' }}>
            {/* ===== BARRA DE BÚSQUEDA Y FILTROS ===== */}
            <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', borderLeft: '4px solid #8b5cf6', paddingLeft: '16px' }}>
                            Tienda
                        </h1>
                        <span style={{
                            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px',
                            background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {filteredProducts.length === products.length
                                ? `${products.length} productos`
                                : `${filteredProducts.length} de ${products.length}`}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                        {/* Buscador global */}
                        <div style={{ position: 'relative' }} ref={searchContainerRef}>
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#6b7280', pointerEvents: 'none' }}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar en todas las categorías..."
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setShowDropdown(false); }}
                                    onFocus={() => { if (globalResults.length > 0) setShowDropdown(true); }}
                                    autoComplete="off"
                                    style={{
                                        width: '100%', minWidth: '260px', background: '#1e1e24',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                        padding: '10px 40px 10px 40px', fontSize: '14px', color: '#fff',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                />
                                {searchQuery.length > 0 && (
                                    <button onClick={clearSearch} style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                                    }}>
                                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Dropdown de resultados globales */}
                            {showDropdown && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                    minWidth: '360px', maxHeight: '440px', overflowY: 'auto',
                                    background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                                    zIndex: 9999,
                                }}>
                                    {isSearching ? (
                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                            <div style={{
                                                width: '28px', height: '28px', border: '3px solid rgba(168,85,247,0.3)',
                                                borderTop: '3px solid #a855f7', borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite', margin: '0 auto 8px',
                                            }} />
                                            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Buscando...</span>
                                        </div>
                                    ) : globalResults.length === 0 ? (
                                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                                No se encontraron resultados para &quot;{searchQuery}&quot;
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '8px 0' }}>
                                            {Object.entries(grouped).map(([category, items]) => (
                                                <div key={category}>
                                                    <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '14px' }}>{categoryIcons[category] || '📦'}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: categoryColors[category] || '#9ca3af' }}>
                                                            {category}
                                                        </span>
                                                    </div>
                                                    {items.map((item) => (
                                                        <button key={item.id} onClick={() => handleResultClick(item)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f12' }}>
                                                                <img src={item.imagen_url || '/img/placeholder.jpg'} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                                                                <div style={{ color: '#6b7280', fontSize: '12px' }}>{item.subcategory}</div>
                                                            </div>
                                                            {item.price !== null && item.price > 0 && (
                                                                <span style={{ color: '#a855f7', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>Bs {item.price.toFixed(2)}</span>
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

                        {/* Filtro por categoría */}
                        {uniqueServers.length > 0 && (
                            <select value={filterServer} onChange={(e) => setFilterServer(e.target.value)}
                                style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 36px 10px 16px', fontSize: '14px', color: '#d1d5db', cursor: 'pointer', appearance: 'none' as const }}>
                                <option value="all">Todos — Categoría</option>
                                {uniqueServers.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        )}

                        {/* Toggle grid/list */}
                        <div style={{ display: 'flex', background: '#1e1e24', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={() => setViewMode('grid')}
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#6b7280' }}>
                                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button onClick={() => setViewMode('list')}
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'list' ? '#fff' : '#6b7280' }}>
                                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== PRODUCTOS ===== */}
            <main className="w-full">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full'
                        : 'flex flex-col gap-4 w-full max-w-5xl mx-auto'
                    }>
                        {filteredProducts.map(p => (
                            <ProductCard key={p.id} product={{
                                id: p.id, title: p.nombre, subtitle: p.server_info,
                                img: p.imagen_url || '/img/placeholder.jpg', price: mostrarPrecio(p),
                                prices: parsePrices(p.variantes_precio), genre: p.categoria
                            }} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
                        <div className="bg-[#1e1e24] p-8 rounded-2xl border border-white/5 flex flex-col items-center max-w-md">
                            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
                            <p className="text-gray-400">No se encontraron productos que coincidan.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function TiendaPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <TiendaContent />
        </Suspense>
    );
}
