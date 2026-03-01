'use client';

import Link from 'next/link';

const NAV_LINKS = [
    { href: '/mantenimiento-componentes', label: 'Mantenimiento PC' },
    { href: '/mantenimiento-componentes', label: 'Componentes' },
    { href: '/mantenimiento-componentes', label: 'Laptops' },
    { href: '/cuentas-streaming', label: 'Streaming & Cuentas' },
];

const INFO_LINKS = [
    { href: '/sobre-nosotros', label: 'Sobre nosotros' },
    { href: '/terminos', label: 'Términos y condiciones' },
];

const SOCIAL = [
    {
        label: 'TikTok',
        href: 'https://www.tiktok.com/@geektech',
        hoverBg: 'rgba(255,255,255,0.12)',
        hoverBorder: 'rgba(255,255,255,0.3)',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.79a8.18 8.18 0 0 0 4.78 1.52V6.87a4.85 4.85 0 0 1-1.01-.18z" />
            </svg>
        ),
    },
    {
        label: 'YouTube',
        href: 'https://www.youtube.com/@geektech',
        hoverBg: 'rgba(255,0,0,0.15)',
        hoverBorder: 'rgba(255,0,0,0.4)',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
    {
        label: 'WhatsApp',
        href: 'https://wa.me/59168190472',
        hoverBg: 'rgba(37,211,102,0.15)',
        hoverBorder: 'rgba(37,211,102,0.4)',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
        ),
    },
];

const PAYMENT_METHODS = ['QR Bolivia', 'Tigo Money', 'Efectivo'];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            background: '#0a0a0f',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: '#9ca3af',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* ── MAIN CONTENT ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 40px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '40px',
                }}>

                    {/* BRAND & SOCIAL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', flexShrink: 0,
                            }}>⚡</div>
                            <span style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>GeekTech</span>
                        </div>

                        {/* Tagline */}
                        <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#6b7280', margin: 0, maxWidth: '220px' }}>
                            Tu tienda tech de confianza en Bolivia. Licencias, servicios y componentes al mejor precio.
                        </p>

                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {SOCIAL.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={s.label}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', textDecoration: 'none',
                                        transition: 'background 0.2s, border-color 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = s.hoverBg;
                                        e.currentTarget.style.borderColor = s.hoverBorder;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* TIENDA */}
                    <div>
                        <h3 style={headingStyle}>Tienda</h3>
                        <ul style={listStyle}>
                            {NAV_LINKS.map(l => (
                                <li key={l.label}>
                                    <Link href={l.href} style={linkStyle}
                                        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#a78bfa')}
                                        onMouseLeave={e => ((e.target as HTMLElement).style.color = '#6b7280')}
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* INFORMACIÓN */}
                    <div>
                        <h3 style={headingStyle}>Información</h3>
                        <ul style={listStyle}>
                            {INFO_LINKS.map(l => (
                                <li key={l.label}>
                                    <Link href={l.href} style={linkStyle}
                                        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#a78bfa')}
                                        onMouseLeave={e => ((e.target as HTMLElement).style.color = '#6b7280')}
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CONTACTO */}
                    <div>
                        <h3 style={headingStyle}>Contacto</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { icon: '📍', text: 'Av. 6 de Marzo, La Paz / El Alto, Bolivia' },
                                { icon: '🕐', text: 'Lun–Sáb: 9:00 – 20:00' },
                                { icon: '📱', text: '+591 68190472' },
                            ].map(item => (
                                <div key={item.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                            <a href="https://geektech.onl" style={{ fontSize: '13px', color: '#a78bfa', textDecoration: 'none', marginTop: '2px' }}>
                                🌐 geektech.onl
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM BAR ── */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '16px 24px',
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                }}>
                    <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>
                        © {year} GeekTech.onl — Todos los derechos reservados.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#4b5563' }}>Pagos:</span>
                        {PAYMENT_METHODS.map(m => (
                            <span key={m} style={{
                                fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: '#6b7280',
                            }}>{m}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Shared micro-styles ─────────────────────────────────────
const headingStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '11px',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '14px',
    margin: '0 0 14px 0',
};

const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
};

const linkStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.15s',
};
