'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of a cart item
export type CartItem = {
    id: string | number;
    title: string;
    price: number | string;
    img: string;
    quantity: number; // Added quantity
    [key: string]: any;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string | number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    isCartOpen: boolean;
    total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Initial Load from LocalStorage
    useEffect(() => {
        setIsMounted(true);
        // Safe check for window
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('geektech_cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
        }

        // Bridge: Listen for legacy 'addToCart' events
        const handleLegacyAdd = (e: CustomEvent) => {
            if (e.detail) {
                addToCart(e.detail);
                setIsCartOpen(true);
            }
        };

        window.addEventListener('addToCart', handleLegacyAdd as EventListener);
        return () => window.removeEventListener('addToCart', handleLegacyAdd as EventListener);
    }, []);

    // Persist to LocalStorage whenever cart changes
    useEffect(() => {
        if (isMounted && typeof window !== 'undefined') {
            localStorage.setItem('geektech_cart', JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setCart((prevCart): CartItem[] => {
            const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
            if (existingItemIndex > -1) {
                // Item exists, update quantity immutably
                return prevCart.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // New item, quantity 1
                return [...prevCart, { ...product, quantity: 1 } as CartItem];
            }
        });
    };

    const removeFromCart = (id: string | number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const total = cart.reduce((sum, item) => {
        const p = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + ((isNaN(p) ? 0 : p) * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, toggleCart, isCartOpen, total }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
