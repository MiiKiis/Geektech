'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BannerConfig {
    titulo: string;
    subtitulo: string;
    btn_texto: string;
    btn_link: string;
    imagen_url: string;
    badge1_icon: string;
    badge1_text: string;
    badge2_icon: string;
    badge2_text: string;
}

const DEFAULTS: BannerConfig = {
    titulo: 'Productos Digitales Sin Límites',
    subtitulo: 'Eleva tu experiencia gamer con nuestra selección premium de software y complementos.',
    btn_texto: 'Ver Productos',
    btn_link: '/mantenimiento-componentes',
    imagen_url: '/img/principal/banner.svg',
    badge1_icon: '🚀',
    badge1_text: 'Rápido',
    badge2_icon: '⚡',
    badge2_text: 'Entrega Inmediata',
};

export default function HeroBanner() {
    const [cfg, setCfg] = useState<BannerConfig>(DEFAULTS);

    useEffect(() => {
        fetch('/api/admin/banner')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data && data.titulo) setCfg(data); })
            .catch(() => { /* usa defaults */ });
    }, []);

    return (
        <section className="renewed-hero" role="banner" aria-label="Destacado GeekTech">
            <div className="renewed-hero-grid">
                <div className="flex flex-col justify-center gap-6">
                    <div className="hero-chip stagger">
                        <span>GeekTech 2.0</span>
                        <span>Experiencia renovada</span>
                    </div>

                    <h1 className="stagger stagger-2 text-4xl md:text-6xl font-bold leading-tight tracking-tight max-w-2xl">
                        {cfg.titulo}
                    </h1>

                    <p className="stagger stagger-3 text-base md:text-lg text-violet-100/85 max-w-xl leading-relaxed">
                        {cfg.subtitulo} Tienda enfocada en productos digitales; mantenimiento y streaming con gestion especializada.
                    </p>

                    <div className="stagger stagger-4 flex flex-wrap gap-3">
                        <Link href={cfg.btn_link || '/mantenimiento-componentes'} className="hero-cta-primary rounded-xl px-6 py-3 font-semibold transition-transform hover:scale-[1.03]">
                            {cfg.btn_texto || 'Ver Productos'}
                        </Link>
                        <Link href="/cuentas-streaming" className="hero-cta-secondary rounded-xl px-6 py-3 font-semibold transition-transform hover:scale-[1.03]">
                            Ver Streaming
                        </Link>
                    </div>

                    <div className="stagger stagger-4 grid grid-cols-2 gap-3 max-w-md">
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                            <p className="text-xs uppercase tracking-wider text-violet-100/80">Entrega</p>
                            <p className="text-xl font-semibold">Inmediata</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                            <p className="text-xs uppercase tracking-wider text-violet-100/80">Soporte</p>
                            <p className="text-xl font-semibold">7 Dias</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center">
                    <div className="hero-figure-frame w-full">
                        <Image
                            src={cfg.imagen_url || '/img/principal/banner.svg'}
                            alt="Banner Geektech - Tienda de Software y Hardware"
                            fill
                            priority
                            className="object-cover"
                            onError={(e) => { (e.target as any).src = '/img/principal/banner.svg'; }}
                        />

                        <div className="hero-floating">
                            <div className="hero-floating-card">
                                <span className="hero-floating-badge">{cfg.badge1_icon}</span>
                                <span>{cfg.badge1_text}</span>
                            </div>
                            <div className="hero-floating-card">
                                <span className="hero-floating-badge">{cfg.badge2_icon}</span>
                                <span>{cfg.badge2_text}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
