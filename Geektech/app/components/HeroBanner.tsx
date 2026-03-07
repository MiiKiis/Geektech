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
        <section className="antigravity-hero" role="banner" aria-label="Destacado">
            <div className="hero-bg-effects">
                <div className="glow-orb orb-1" />
                <div className="glow-orb orb-2" />
            </div>

            <Image
                src={cfg.imagen_url || '/img/principal/banner.svg'}
                alt="Banner Geektech - Tienda de Software y Hardware"
                fill
                priority
                className="hero-bg-image object-cover"
                style={{ zIndex: 1 }}
                onError={(e) => { (e.target as any).src = '/img/principal/banner.svg'; }}
            />

            <div className="hero-content">
                <h1>{cfg.titulo}</h1>
                <p>{cfg.subtitulo}</p>
                <div className="hero-actions">
                    <Link href={cfg.btn_link || '/mantenimiento-componentes'} className="btn-hero primary-glow">
                        {cfg.btn_texto || 'Ver Productos'}
                    </Link>
                </div>
            </div>

            <div className="hero-visuals">
                <div className="floating-card glass-card">
                    <div className="icon-box">{cfg.badge1_icon}</div>
                    <span>{cfg.badge1_text}</span>
                </div>
                <div className="floating-card glass-card delayed">
                    <div className="icon-box">{cfg.badge2_icon}</div>
                    <span>{cfg.badge2_text}</span>
                </div>
            </div>
        </section>
    );
}
