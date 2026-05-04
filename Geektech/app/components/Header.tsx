'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, ShoppingCart } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const { toggleCart, cart } = useCart();
    const { data: session } = useSession();

    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Cerrar menú al cambiar de página
    useEffect(() => { 
        setMenuOpen(false); 
        setUserMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleResize = () => {
            if (window.innerWidth > 1024 && menuOpen) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize);
        };
    }, [menuOpen]);

    const isActive = (path: string) => pathname === path ? 'active' : '';
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <header role="banner" suppressHydrationWarning className="sticky top-0 z-[100] bg-gray-950/80 backdrop-blur-lg border-b border-purple-900/20">
                <div className="header-inner max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

                    {/* LOGO */}
                    <div className="brand-wrapper">
                        <Link href="/" className="logo-link flex items-center gap-2 group" aria-label="Inicio">
                            <img
                                src="/img/principal/logo.png"
                                alt="Geektech Logo"
                                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                            <span className="brand-name text-xl font-black tracking-tighter text-white uppercase group-hover:text-purple-400 transition-colors">Geektech</span>
                        </Link>
                    </div>

                    {/* NAV DESKTOP */}
                    <nav className="main-nav hidden lg:flex items-center gap-8" aria-label="Navegación principal">
                        <Link href="/" className={`text-sm font-bold uppercase tracking-widest hover:text-purple-400 transition-colors ${isActive('/') ? 'text-purple-500' : 'text-gray-400'}`}>Inicio</Link>
                        <Link href="/mantenimiento-componentes" className={`text-sm font-bold uppercase tracking-widest hover:text-purple-400 transition-colors ${isActive('/mantenimiento-componentes') ? 'text-purple-500' : 'text-gray-400'}`}>Mantenimiento</Link>
                        <Link href="/cuentas-streaming" className={`text-sm font-bold uppercase tracking-widest hover:text-purple-400 transition-colors ${isActive('/cuentas-streaming') ? 'text-purple-500' : 'text-gray-400'}`}>Streaming</Link>
                    </nav>

                    {/* ACCIONES */}
                    <div className="nav-actions flex items-center gap-4">
                        {/* Carrito */}
                        <button
                            className="relative p-2 text-gray-400 hover:text-purple-400 transition-colors"
                            onClick={toggleCart}
                        >
                            <ShoppingCart size={22} />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Usuario */}
                        <div className="relative">
                            {session ? (
                                <div className="relative">
                                    <button 
                                        className="p-2 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        <User size={20} />
                                    </button>
                                    
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-purple-900/50 rounded-2xl shadow-2xl py-3 z-[110] animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 pb-3 border-b border-gray-800 mb-2">
                                                <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest mb-1">Usuario</p>
                                                <p className="text-sm text-gray-100 font-bold truncate">{session.user?.name || session.user?.email}</p>
                                            </div>
                                            <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/20 hover:text-purple-300 transition-colors">
                                                Mi Perfil
                                            </Link>
                                            {(session.user as any).role === 'admin' && (
                                                <Link href="/admin/history" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/20 hover:text-purple-300 transition-colors">
                                                    Historial de Ventas
                                                </Link>
                                            )}
                                            <div className="mt-2 pt-2 border-t border-gray-800">
                                                <button 
                                                    onClick={() => signOut()}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 flex items-center gap-2 transition-colors"
                                                >
                                                    <LogOut size={16} /> Salir de la red
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link 
                                    href="/login" 
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-xs font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                >
                                    <User size={16} />
                                    <span>Ingresar</span>
                                </Link>
                            )}
                        </div>

                        {/* Hamburguesa (mobile) */}
                        <button
                            className={`flex flex-col gap-1.5 lg:hidden p-2`}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span className={`block w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MENÚ MOBILE */}
            <div className={`fixed inset-0 z-[90] bg-gray-950 transform transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <nav className="flex flex-col items-center justify-center h-full gap-8">
                    <Link href="/" className="text-2xl font-black uppercase tracking-widest text-white hover:text-purple-400" onClick={() => setMenuOpen(false)}>Inicio</Link>
                    <Link href="/mantenimiento-componentes" className="text-2xl font-black uppercase tracking-widest text-white hover:text-purple-400" onClick={() => setMenuOpen(false)}>Mantenimiento</Link>
                    <Link href="/cuentas-streaming" className="text-2xl font-black uppercase tracking-widest text-white hover:text-purple-400" onClick={() => setMenuOpen(false)}>Streaming</Link>
                    {!session && (
                        <Link href="/login" className="mt-4 px-8 py-3 bg-purple-600 rounded-full font-bold uppercase tracking-widest text-white" onClick={() => setMenuOpen(false)}>Ingresar</Link>
                    )}
                </nav>
            </div>
        </>
    );
}
