 'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard, { Product } from './ProductCard';
import { parsePrices, mostrarPrecio } from '../lib/price';
import ProductFilter from './ProductFilter';

export default function StoreSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await fetch('/api/products/home-game');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();

                // parsing handled by shared utility `parsePrices`

                const mapped: Product[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.nombre,
                    subtitle: item.categoria || item.server_info || '',
                    description: item.descripcion || '',
                    price: mostrarPrecio(item),
                    img: item.imagen_url || item.imagen || '/img/placeholder.jpg',
                    prices: parsePrices(item.variantes_precio),
                    genre: item.categoria || '',
                    platform: 'pc',
                    imagenes_adicionales: item.imagenes_adicionales || [],
                    agotado: !!item.agotado,
                    destacado: !!item.destacado,
                    detailHref: `/producto/juegos/${item.id}`,
                }));

                setProducts(mapped);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const uniqueCategories = Array.from(new Set(products.map(p => p.genre))).filter(Boolean) as string[];

    const filteredProducts = products.filter(p => {
        if (filterCategory !== 'all' && p.genre !== filterCategory) return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q));
        }
        return true;
    });

    return (
        <section className="renewed-store-shell px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar: Featured Products */}
                <aside className="hidden lg:block w-[280px] sticky top-[100px] shrink-0">
                    <div className="bg-gradient-to-b from-[#1c1537] to-[#151129] rounded-3xl border border-[#3b2b69] p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-base font-black text-white uppercase tracking-wider m-0">Más Comprados</h3>
                        </div>
                        
                        <div className="flex flex-col gap-5">
                            {products.filter(p => !!p.destacado).slice(0, 5).map(p => (
                                <Link key={p.id} href={p.detailHref || `/producto/juegos/${p.id}`} className="group cursor-pointer block">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 bg-black/40 relative">
                                            <Image 
                                                src={p.img} 
                                                alt={p.title} 
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-110" 
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-white mb-1 truncate">{p.title}</div>
                                            <div className="text-xs font-black text-[#c6a2ff] uppercase">{typeof p.price === 'number' ? `Bs ${p.price.toFixed(2)}` : p.price}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {products.filter(p => p.destacado).length === 0 && (
                                <p className="text-gray-500 text-xs text-center py-4 italic">Nuevos destacados próximamente</p>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <button className="w-full py-3 bg-[#6f2dff] hover:bg-[#5f23e2] text-white text-xs font-bold rounded-xl transition-all border border-[#8d52ff] uppercase tracking-widest">
                                Ver Ofertas
                            </button>
                        </div>
                    </div>
                </aside>

                <main role="main" className="flex-1 w-full">
                <ProductFilter
                    title="Destacados"
                    accentColor="purple"
                    filterLabel="Categoría"
                    filterOptions={uniqueCategories}
                    filterValue={filterCategory}
                    onFilterChange={setFilterCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    totalCount={products.length}
                    filteredCount={filteredProducts.length}
                />

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#9b5cff] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'
                        : 'flex flex-col gap-4 w-full'
                    }>
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
                        <div className="bg-[#1e1e24] p-8 rounded-2xl border border-white/5 flex flex-col items-center max-w-md">
                            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
                            <p className="text-gray-400">No se encontraron productos que coincidan con tu búsqueda.</p>
                        </div>
                    </div>
                )}
                </main>
            </div>
        </section>
    );
}
