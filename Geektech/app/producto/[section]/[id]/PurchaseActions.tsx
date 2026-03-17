'use client';

import { useMemo, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { parsePrices } from '@/app/lib/price';

type PurchaseActionsProps = {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    category: string;
    basePrice: number | null;
    variantsRaw: string | null;
    agotado: boolean;
};

export default function PurchaseActions({
    id,
    title,
    subtitle,
    description,
    image,
    category,
    basePrice,
    variantsRaw,
    agotado,
}: PurchaseActionsProps) {
    const { addToCart, openCart } = useCart();
    const variants = useMemo(() => parsePrices(variantsRaw), [variantsRaw]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const selectedVariant = variants[selectedIndex] ?? null;
    const currentPrice = selectedVariant
        ? (typeof selectedVariant.value === 'string' ? parseFloat(selectedVariant.value) || 0 : selectedVariant.value)
        : (basePrice ?? 0);
    const selectedExtraTitle = selectedVariant?.extraTitle?.trim() || '';

    const finalTitle = selectedVariant ? `${title} - ${selectedVariant.label}` : title;
    const finalId = selectedVariant ? `${id}-${selectedVariant.label.replace(/\s+/g, '-').toLowerCase()}` : id;

    const handleAddToCart = () => {
        if (agotado) return;
        addToCart({
            id: finalId,
            title: finalTitle,
            price: currentPrice,
            img: image,
            category,
            subtitle,
        });
        openCart();
    };

    const handleBuyNow = () => {
        if (agotado) return;
        const message = encodeURIComponent(
            `Hola GeekTech, quiero comprar:\n\n• Producto: ${finalTitle}\n• Categoría: ${category}${subtitle ? `\n• Detalle: ${subtitle}` : ''}${currentPrice ? `\n• Precio: Bs ${currentPrice.toFixed(2)}` : ''}${description ? `\n\n${description.slice(0, 180)}` : ''}`
        );
        window.open(`https://api.whatsapp.com/send?phone=59168190472&text=${message}`, '_blank');
    };

    return (
        <div className="flex flex-col gap-5">
            {variants.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Opciones</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {variants.map((variant, index) => {
                            const variantPrice = typeof variant.value === 'string' ? parseFloat(variant.value) || 0 : variant.value;
                            const active = selectedIndex === index;
                            const extraTitle = variant.extraTitle?.trim();
                            return (
                                <button
                                    key={`${variant.label}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${active ? 'border-purple-500 bg-purple-500/15' : 'border-white/10 bg-[#141421] hover:border-purple-400/40'}`}
                                >
                                    {extraTitle && (
                                        <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400">{extraTitle}</div>
                                    )}
                                    <div className="text-sm font-semibold text-white">{variant.label}</div>
                                    <div className="mt-1 text-sm text-purple-300">Bs {variantPrice.toFixed(2)}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#12121c] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Precio</p>
                <div className="mt-2 text-3xl font-black text-purple-300">
                    {currentPrice > 0 ? `Bs ${currentPrice.toFixed(2)}` : 'Consultar'}
                </div>
                {selectedExtraTitle && (
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{selectedExtraTitle}</div>
                )}
                {agotado && <div className="mt-3 text-sm font-semibold text-red-400">Producto agotado</div>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={agotado}
                    className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Añadir al carrito
                </button>
                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={agotado}
                    className="flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-bold text-white transition hover:border-purple-400 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Comprar ahora
                </button>
            </div>
        </div>
    );
}
