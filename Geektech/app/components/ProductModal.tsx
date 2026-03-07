'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from './ProductCard';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

function extractPricesFromRawPrice(priceData: string | number): { label: string; value: number | string }[] {
    if (typeof priceData === 'number') return [];
    if (!priceData) return [];

    const priceString = String(priceData);
    // If it doesn't look like a list of variants, don't try to parse it
    if (!priceString.includes(':') && !priceString.includes(',')) {
        return [];
    }

    const parts = priceString.split(',').map(p => p.trim()).filter(p => p !== '');
    const extracted: { label: string; value: number | string }[] = [];

    for (const part of parts) {
        if (part.includes(':')) {
            const [label, priceStr] = part.split(':').map(s => s.trim());
            const priceNum = parseFloat(priceStr);
            extracted.push({ label, value: !isNaN(priceNum) ? priceNum : priceStr });
        } else {
            const priceNum = parseFloat(part);
            if (!isNaN(priceNum)) {
                extracted.push({ label: `${priceNum} Bs`, value: priceNum });
            } else if (part.length > 0) {
                extracted.push({ label: part, value: part });
            }
        }
    }
    return extracted;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const [selectedOption, setSelectedOption] = useState<{ label: string; value: number | string } | null>(null);
    const [currentImg, setCurrentImg] = useState(product.img);

    React.useEffect(() => {
        if (isOpen) {
            setCurrentImg(product.img);
            setSelectedOption(null);
        }
    }, [isOpen, product.img]);

    const allImages = [product.img, ...(product.imagenes_adicionales || [])].filter(Boolean);

    const parsedOptions = extractPricesFromRawPrice(product.price);
    const options = (product.prices && product.prices.length > 0) ? product.prices : parsedOptions;
    const showOptions = options.length > 0;

    const basePrice = (typeof product.price === 'number' || !isNaN(parseFloat(String(product.price))))
        ? parseFloat(String(product.price))
        : (showOptions ? 0 : String(product.price));

    const handleAddToCart = () => {
        let finalPrice = basePrice;
        let finalTitle = product.title;
        let finalId = String(product.id);

        if (showOptions) {
            if (!selectedOption) return;
            finalPrice = selectedOption.value;
            finalTitle = `${product.title} - ${selectedOption.label}`;
            finalId = `${product.id}-${selectedOption.label.replace(/\s+/g, '-').toLowerCase()}`;
        }

        addToCart({
            ...product,
            price: finalPrice,
            title: finalTitle,
            id: finalId
        } as any);
        onClose();
        setSelectedOption(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        >
                            <div className="relative border-b border-white/10 bg-[#1a1a1a]">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-white hover:bg-black/40 bg-black/20 backdrop-blur-md rounded-full z-10 transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                                </button>
                                
                                <div className="w-full h-64 sm:h-72 bg-black/40 overflow-hidden relative flex items-center justify-center">
                                    <img src={currentImg} alt={product.title} className="w-full h-full object-contain p-4" />
                                </div>
                                
                                {allImages.length > 1 && (
                                    <div className="flex gap-3 px-6 py-4 overflow-x-auto bg-black/20 items-center justify-start border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
                                        {allImages.map((img, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => setCurrentImg(img)} 
                                                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentImg === img ? 'border-purple-500 scale-105 shadow-md shadow-purple-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            >
                                                <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="p-6 bg-[#1a1a1a] border-b border-white/5">
                                    <div className="flex gap-3 mb-2 flex-wrap">
                                        <span className="text-xs font-bold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md uppercase tracking-wider">
                                            {product.genre || product.platform || 'Producto'}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                        {product.title}
                                    </h3>
                                    <p className="text-white/90 text-lg sm:text-xl leading-relaxed font-medium bg-gradient-to-br from-white/10 to-transparent p-5 rounded-2xl border border-white/10 shadow-inner">
                                        {product.subtitle || 'Este producto premium ha sido seleccionado cuidadosamente para garantizar la mejor calidad y rendimiento en tus necesidades tecnológicas.'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto bg-[#121212]">
                                {showOptions ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedOption(option)}
                                                className={`relative w-full py-3 px-4 rounded-xl border transition-all duration-200 flex flex-col items-start gap-1 text-left
                                                    ${selectedOption === option
                                                        ? 'bg-purple-primary/20 border-purple-primary shadow-[0_0_15px_rgba(112,0,255,0.2)]'
                                                        : 'bg-[#1e1e24] border-white/5 hover:border-white/20 hover:bg-[#25252b]'
                                                    }`}
                                            >
                                                <span className={`font-bold text-sm ${selectedOption === option ? 'text-white' : 'text-gray-200'}`}>
                                                    {option.label}
                                                </span>
                                                <span className={`text-xs ${selectedOption === option ? 'text-purple-300' : 'text-gray-500'}`}>
                                                    {typeof option.value === 'number' ? `Bs ${option.value.toFixed(2)}` : option.value}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-[#1e1e24] border border-white/5 rounded-xl flex justify-between items-center">
                                        <span className="text-gray-300 font-medium">Precio Estándar</span>
                                        <span className="text-xl font-bold text-purple-400">
                                            {typeof basePrice === 'number' && !isNaN(basePrice) ? `Bs ${basePrice.toFixed(2)}` : basePrice}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-[#1a1a1a] shrink-0">
                                <button
                                    onClick={handleAddToCart}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2
                                        ${product.agotado
                                            ? 'bg-red-900/40 text-red-300 border border-red-500/30 cursor-not-allowed grayscale-[0.5]'
                                            : (!showOptions || selectedOption)
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02] hover:shadow-purple-900/60'
                                                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    {product.agotado ? (
                                        <>⛔ PRODUCTO AGOTADO</>
                                    ) : !showOptions ? (
                                        `Añadir al Carrito - ${typeof basePrice === 'number' && !isNaN(basePrice) ? `Bs ${basePrice.toFixed(2)}` : basePrice}`
                                    ) : selectedOption ? (
                                        `Añadir al Carrito - ${typeof selectedOption.value === 'number' ? `Bs ${selectedOption.value.toFixed(2)}` : selectedOption.value}`
                                    ) : (
                                        'Selecciona un Paquete'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductModal;
