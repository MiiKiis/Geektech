'use client';

import React, { useEffect, useState } from 'react';
import { parsePrices, mostrarPrecio } from '../lib/price';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
    category?: string;
    viewMode?: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ category, viewMode = 'grid' }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                let url = `/api/products/${category || 'tienda'}`;
                if (category === 'juegos') url = '/api/products/tienda';
                if (category === 'mantenimiento-componentes') url = '/api/products/mantenimiento-componentes';
                if (category === 'streaming') url = '/api/products/cuentas-streaming';

                const res = await fetch(url);
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
    }, [category]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
                <div className="bg-[#1e1e24] p-8 rounded-2xl border border-white/5 flex flex-col items-center max-w-md">
                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">No hay productos</h3>
                    <p className="text-gray-400">Vuelve pronto para ver novedades.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'
            : 'flex flex-col gap-4 w-full'
        }>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
        </div>
    );
};

export default ProductGrid;
