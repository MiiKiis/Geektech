'use client';

import { useCart } from '../context/CartContext';
import { useEffect, useRef } from 'react';

export default function CartSidebar() {
    const { cart, removeFromCart, isCartOpen, toggleCart, total } = useCart();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
                toggleCart();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCartOpen, toggleCart]);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        let message = "Hola GeekTech, me interesa comprar:\n\n";
        cart.forEach(item => {
            const priceNum = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
            message += `• ${item.quantity}x ${item.title} - ${priceNum * item.quantity} Bs\n`;
        });
        message += `\n*Total a Pagar: ${total} Bs*`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=59168190472&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toggleCart();
    };

    if (!isCartOpen) return null;

    return (
        <div className="cart-sidebar-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999, // High z-index to stay on top
            display: 'flex',
            justifyContent: 'flex-end',
            opacity: 1,
            transition: 'opacity 0.3s'
        }}>
            <div ref={sidebarRef} className="cart-sidebar" style={{
                width: '380px',
                maxWidth: '90%',
                height: '100%',
                backgroundColor: 'var(--bg-card)',
                boxShadow: '-4px 0 15px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Carrito ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
                    <button onClick={toggleCart} aria-label="Cerrar carrito" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {cart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <p>Tu carrito está vacío.</p>
                            <button onClick={toggleCart} style={{ marginTop: '1rem', padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Ir a comprar
                            </button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.id}-${index}`} style={{ display: 'flex', marginBottom: '16px', backgroundColor: 'var(--bg-body)', borderRadius: '12px', padding: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, marginRight: '12px' }}>
                                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>{item.title}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {item.price} Bs x {item.quantity}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Sub: {(typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price) * item.quantity} Bs
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} aria-label="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4a4a', padding: '0 0 0 10px', display: 'flex', alignItems: 'center' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>Subtotal</span>
                        <span>{total} Bs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        <span>Total</span>
                        <span>{total} Bs</span>
                    </div>
                    {/* WhatsApp Checkout Link */}
                    <a
                        href={cart.length > 0 ? `https://api.whatsapp.com/send?phone=59168190472&text=${encodeURIComponent(
                            "Hola GeekTech, me interesa comprar:\n\n" +
                            cart.map(i => `• ${i.quantity}x ${i.title} - ${(typeof i.price === 'string' ? parseFloat(i.price) || 0 : i.price) * i.quantity} Bs`).join('\n') +
                            `\n\n*Total a Pagar: ${total} Bs*`
                        )}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (cart.length === 0) e.preventDefault();
                            else toggleCart();
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: '#25D366', // WhatsApp Brand Color
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            opacity: cart.length === 0 ? 0.6 : 1,
                            transition: 'background-color 0.2s',
                            textDecoration: 'none'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Completar Pedido
                    </a>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                        Serás redirigido a WhatsApp para coordinar el pago.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
