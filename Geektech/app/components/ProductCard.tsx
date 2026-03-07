'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ProductModal from './ProductModal';

export interface Product {
    id: string | number;
    title: string;
    subtitle?: string;
    price: number | string;
    img: string;
    prices?: { label: string; value: number | string }[];
    genre?: string;
    platform?: string;
    imagenes_adicionales?: string[];
    agotado?: boolean;
    destacado?: boolean;
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
                className={`relative overflow-hidden transition-colors duration-300 hover:border-purple-500/50 bg-[#1e1e24] border border-white/5 rounded-2xl will-change-transform transform-gpu
                    ${isList ? 'flex flex-row w-full h-48' : 'flex flex-col h-full w-full'}
                    ${product.agotado ? 'opacity-75 grayscale-[0.5]' : ''}`}
                whileHover={product.agotado ? {} : { y: isList ? -2 : -10, scale: isList ? 1.005 : 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {product.agotado && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="bg-red-600/90 text-white font-black px-6 py-2 rounded-lg text-lg transform -rotate-12 shadow-2xl border-2 border-white/20 uppercase tracking-widest scale-110">
                            Agotado
                        </div>
                    </div>
                )}
                <div
                    className={`relative overflow-hidden ${isList ? 'w-64 shrink-0' : 'w-full'} transform-gpu`}
                    style={!isList ? { aspectRatio: '3/4' } : { height: '100%' }}
                >
                    <motion.div 
                        className="w-full h-full relative"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Image
                            src={product.img}
                            alt={product.title}
                            fill
                            sizes={isList ? "256px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                            priority={product.destacado}
                            className="object-cover transition-opacity duration-300"
                            loading={product.destacado ? "eager" : "lazy"}
                        />
                    </motion.div>
                </div>

                <div className={`flex ${isList ? 'flex-row items-center justify-between w-full p-6 gap-6' : 'flex-col flex-grow p-4'}`}>
                    <div className="flex-grow min-w-0">
                        <h3 className={`font-black mb-2 leading-tight bg-gradient-to-r from-purple-400 to-blue-300 bg-clip-text text-transparent ${isList ? 'text-2xl' : 'text-xl line-clamp-1'}`} title={product.title}>
                            {product.title}
                        </h3>
                        {product.subtitle && (
                            <p className={`text-gray-300/90 mb-4 line-clamp-2 leading-relaxed font-medium ${isList ? 'text-lg' : 'text-[16px]'}`}>
                                {product.subtitle}
                            </p>
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
                            className={`w-full py-3 px-4 font-bold rounded-full transition-all shadow-xl
                                ${product.agotado 
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-white/10' 
                                    : 'bg-purple-primary text-white shadow-[0_4px_15px_rgba(112,0,255,0.4)] hover:bg-purple-hover hover:shadow-[0_6px_20px_rgba(112,0,255,0.6)]'}`}
                            whileTap={product.agotado ? {} : { scale: 0.95 }}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!product.agotado) setIsModalOpen(true); 
                            }}
                        >
                            {product.agotado ? 'Sin Stock' : 'Seleccionar'}
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
