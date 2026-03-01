'use client';

import { useState } from 'react';

interface Variant {
    label: string;
    value: number;
}

interface VariantSelectorProps {
    productName: string;
    productCategory: string | null;
    variants: Variant[];
    basePrice: number | null;
    accentColor: string;
}

export default function VariantSelector({
    productName,
    productCategory,
    variants,
    basePrice,
    accentColor,
}: VariantSelectorProps) {
    const [selected, setSelected] = useState<Variant | null>(null);

    const hasVariants = variants.length > 0;
    const canSend = !hasVariants || selected !== null;

    const whatsappMessage = () => {
        const option = selected ? `\n• Opción: ${selected.label} — Bs ${selected.value.toFixed(2)}` : '';
        const category = productCategory ? `\n• Categoría: ${productCategory}` : '';
        return encodeURIComponent(
            `Hola GeekTech, me interesa:\n\n• ${productName}${category}${option}\n\n¿Podría darme más información?`
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Variant picker ── */}
            {hasVariants && (
                <div style={{
                    background: `${accentColor}0d`,
                    border: `1px solid ${accentColor}2a`,
                    borderRadius: '16px',
                    padding: '20px',
                }}>
                    <p style={{
                        fontSize: '11px', fontWeight: 700, color: accentColor,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        margin: '0 0 14px',
                    }}>
                        Selecciona una opción
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '8px',
                    }}>
                        {variants.map((v, i) => {
                            const isSelected = selected?.label === v.label;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelected(v)}
                                    style={{
                                        background: isSelected ? `${accentColor}22` : '#1e1e2c',
                                        border: isSelected
                                            ? `2px solid ${accentColor}`
                                            : '2px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        textAlign: 'left',
                                        transition: 'all 0.15s',
                                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                    }}
                                >
                                    {isSelected && (
                                        <span style={{
                                            fontSize: '9px', fontWeight: 800,
                                            color: accentColor, textTransform: 'uppercase',
                                            letterSpacing: '0.08em', marginBottom: '2px',
                                        }}>✓ Seleccionado</span>
                                    )}
                                    <span style={{ fontSize: '12px', color: isSelected ? '#fff' : '#9ca3af' }}>
                                        {v.label}
                                    </span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: accentColor }}>
                                        Bs {v.value.toFixed(2)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected summary */}
                    {selected && (
                        <div style={{
                            marginTop: '14px',
                            padding: '10px 14px',
                            background: `${accentColor}15`,
                            border: `1px solid ${accentColor}30`,
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{ fontSize: '13px', color: '#d1d5db' }}>
                                {selected.label}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: accentColor }}>
                                Bs {selected.value.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Price (no variants) ── */}
            {!hasVariants && basePrice !== null && (
                <div style={{
                    background: `${accentColor}0d`,
                    border: `1px solid ${accentColor}2a`,
                    borderRadius: '16px',
                    padding: '20px',
                }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                        Precio
                    </p>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: accentColor }}>
                        Bs {basePrice.toFixed(2)}
                    </span>
                </div>
            )}

            {/* ── WhatsApp CTA ── */}
            {hasVariants && !selected ? (
                // Disabled state
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    cursor: 'not-allowed',
                }}>
                    <span style={{ fontSize: '18px' }}>👆</span>
                    <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '14px' }}>
                        Selecciona una opción primero
                    </span>
                </div>
            ) : (
                <a
                    href={`https://wa.me/59168190472?text=${whatsappMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        padding: '14px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: '#fff', fontWeight: 700, fontSize: '15px',
                        borderRadius: '12px', textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(37,211,102,0.2)',
                        transition: 'opacity 0.2s',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    {selected
                        ? `Consultar — ${selected.label} (Bs ${selected.value.toFixed(2)})`
                        : 'Consultar por WhatsApp'
                    }
                </a>
            )}
        </div>
    );
}
