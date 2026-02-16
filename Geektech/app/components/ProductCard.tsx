'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductModal from './ProductModal';

export interface Product {
    id: string | number;
    title: string;
    subtitle?: string;
    price: number | string;
    img: string;
    prices?: { label: string; value: number }[];
    genre?: string;
    platform?: string;
}

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isList = viewMode === 'list';

    return (
        <>
            <motion.article
                className={`relative overflow-hidden transition-colors duration-300 hover:border-purple-500/50 bg-[#1e1e24] border border-white/5 rounded-2xl
                    ${isList ? 'flex flex-row w-full h-48' : 'flex flex-col h-full w-full'}`}
                whileHover={{ y: isList ? -2 : -10, scale: isList ? 1.005 : 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div
                    className={`relative overflow-hidden ${isList ? 'w-64 shrink-0' : 'w-full'}`}
                    style={!isList ? { aspectRatio: '3/4' } : { height: '100%' }}
                >
                    <motion.img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className={`flex ${isList ? 'flex-row items-center justify-between w-full p-6 gap-6' : 'flex-col flex-grow p-4'}`}>
                    <div className="flex-grow min-w-0">
                        <h3 className={`font-bold text-white mb-2 ${isList ? 'text-2xl' : 'text-lg line-clamp-1'}`} title={product.title}>
                            {product.title}
                        </h3>
                        {product.subtitle && (
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.subtitle}</p>
                        )}
                        {typeof product.price === 'string' && product.price ? (
                            <div className="text-xl font-bold text-purple-400 mb-4">{product.price}</div>
                        ) : (product.prices && product.prices.length > 0) ? (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                                Opciones Disponibles
                            </span>
                        ) : (typeof product.price === 'number' && product.price > 0) ? (
                            <div className="text-xl font-bold text-purple-400 mb-4">
                                Bs {product.price.toFixed(2)}
                            </div>
                        ) : null}
                    </div>

                    <div className={isList ? 'w-48 shrink-0' : 'mt-auto w-full'}>
                        <motion.button
                            className="w-full py-3 px-4 bg-purple-primary text-white font-bold rounded-full shadow-[0_4px_15px_rgba(112,0,255,0.4)] hover:bg-purple-hover hover:shadow-[0_6px_20px_rgba(112,0,255,0.6)] transition-all"
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                        >
                            Seleccionar
                        </motion.button>
                    </div>
                </div>
            </motion.article>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default ProductCard;
