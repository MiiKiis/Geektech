 'use client';

import React, { useEffect, useState } from 'react';
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
                    price: mostrarPrecio(item),
                    img: item.imagen_url || item.imagen || '/img/placeholder.jpg',
                    prices: parsePrices(item.variantes_precio),
                    genre: item.categoria || '',
                    platform: 'pc'
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
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
            <main role="main" className="w-full">
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
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
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
    );
}
