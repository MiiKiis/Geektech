'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────
type Section = 'dashboard' | 'banner' | 'inicio' | 'mantenimiento' | 'streaming';

interface BaseProduct { id: number; nombre: string; descripcion: string | null; precio: string | null; imagen_url: string | null; variantes_precio: string | null; posicion: number | null; destacado?: boolean; agotado?: boolean; }
interface HomeProduct extends BaseProduct { categoria: string | null; }
interface MantProduct extends BaseProduct { categoria: string; tipo: string | null; }
interface StreamProduct extends BaseProduct { plataforma: string | null; duracion: string | null; destacado?: boolean; imagenes_adicionales?: any; }
interface PriceVariant { label: string; value: string; }

// ── Constants ────────────────────────────────────────────────
const ADMIN_PASSWORD_HASH = '95c82faedb5adebc2fd3121c64cb178eca183c1a2911b9efe8f0bd4272abf2da';

async function hashPW(str: string) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const MANT_CATS = ['Mantenimiento', 'Componentes', 'Laptops', 'Accesorios'];
const PLATFORMS = ['Netflix', 'Disney+', 'HBO Max', 'Spotify', 'YouTube Premium', 'Amazon Prime', 'Apple TV+', 'Crunchyroll', 'Otro'];
const DURATIONS = ['1 mes', '3 meses', '6 meses', '12 meses', 'Permanente'];

const SECTION_META = {
    inicio: { label: 'Inicio / Juegos', icon: '🎮', color: '#a855f7', api: '/api/admin/home-game' },
    mantenimiento: { label: 'Mantenimiento y Tienda', icon: '🔧', color: '#8b5cf6', api: '/api/admin/products' },
    streaming: { label: 'Streaming', icon: '📺', color: '#10b981', api: '/api/admin/streaming' },
};

// ── Helpers ──────────────────────────────────────────────────
function parseVariants(str: string | null): PriceVariant[] {
    if (!str) return [];
    try { const a = JSON.parse(str); if (Array.isArray(a)) return a.map(v => ({ label: String(v.label ?? ''), value: String(v.value ?? '') })); } catch { }
    return [];
}
function buildVariantsJSON(vs: PriceVariant[]) {
    const c = vs.filter(v => v.label.trim() && v.value.trim());
    return c.length ? JSON.stringify(c.map(v => ({ label: v.label.trim(), value: v.value.trim() }))) : '';
}
function parseImages(str: any): string[] {
    if (!str) return [];
    if (typeof str === 'string') {
        try { const a = JSON.parse(str); if (Array.isArray(a)) return a; } catch { }
    }
    if (Array.isArray(str)) return str;
    return [];
}

// ════════════════════════════════════════════════════════════
export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [pw, setPw] = useState('');
    const [pwErr, setPwErr] = useState('');
    const [section, setSection] = useState<Section>('dashboard');
    const [menuOpen, setMenuOpen] = useState(false);

    // data per section
    const [homeData, setHomeData] = useState<HomeProduct[]>([]);
    const [mantData, setMantData] = useState<MantProduct[]>([]);
    const [streamData, setStreamData] = useState<StreamProduct[]>([]);
    const [counts, setCounts] = useState({ inicio: 0, mantenimiento: 0, streaming: 0 });

    // banner state
    const [banner, setBanner] = useState({
        titulo: 'Productos Digitales Sin Límites',
        subtitulo: 'Eleva tu experiencia gamer con nuestra selección premium de software y complementos.',
        btn_texto: 'Ver Productos',
        btn_link: '/mantenimiento-componentes',
        imagen_url: '/img/principal/banner.svg',
        badge1_icon: '🚀', badge1_text: 'Rápido',
        badge2_icon: '⚡', badge2_text: 'Entrega Inmediata',
        mant_titulo: 'Mantenimiento Profesional de PC',
        mant_subtitulo: 'Optimiza tu equipo con limpieza profunda, cambio de pasta térmica, gestión de cables y actualización de controladores.',
        mant_imagen_url: '/pc_maintenance_service_banner_1772868547157.png',
        mant_btn_texto: 'AGENDAR CITA',
        mant_msg_whatsapp: 'Hola! Me interesa un mantenimiento para mi PC.',
    });
    const [bannerSaving, setBannerSaving] = useState(false);
    const [bannerLoaded, setBannerLoaded] = useState(false);

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<Record<string, string>>({});
    const [initialForm, setInitialForm] = useState<Record<string, string>>({});
    const [usaVariantes, setUsaVariantes] = useState(false);
    const [variants, setVariants] = useState<PriceVariant[]>([{ label: '', value: '' }]);
    const [initialVariants, setInitialVariants] = useState<PriceVariant[]>([{ label: '', value: '' }]);
    const [addImgs, setAddImgs] = useState<string[]>([]);
    const [initialAddImgs, setInitialAddImgs] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [delConfirm, setDelConfirm] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    
    // quick view state
    const [quickView, setQuickView] = useState<any>(null);
    const [quickViewImg, setQuickViewImg] = useState<string>('');

    const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };
    const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

    // ── Auth ──
    const login = async () => {
        if (!pw) { setPwErr('Ingresa una contraseña'); return; }
        const h = await hashPW(pw);
        if (h === ADMIN_PASSWORD_HASH) {
            setAuthed(true);
            setPwErr('');
            setPw(''); // clear pass
        } else {
            setPwErr('Contraseña incorrecta.');
        }
    };

    // ── Load ──
    const loadSection = useCallback(async (sec: Section) => {
        if (sec === 'dashboard') return;
        setLoading(true);
        try {
            const meta = SECTION_META[sec as keyof typeof SECTION_META];
            const res = await fetch(meta.api);
            const data = await res.json();
            if (sec === 'inicio') setHomeData(Array.isArray(data) ? data : []);
            if (sec === 'mantenimiento') setMantData(Array.isArray(data) ? data : []);
            if (sec === 'streaming') setStreamData(Array.isArray(data) ? data : []);
        } catch { showToast('Error al cargar datos', false); }
        finally { setLoading(false); }
    }, []);

    const loadAll = useCallback(async () => {
        const [h, m, s] = await Promise.allSettled([
            fetch('/api/admin/home-game').then(r => r.json()),
            fetch('/api/admin/products').then(r => r.json()),
            fetch('/api/admin/streaming').then(r => r.json()),
        ]);
        setCounts({
            inicio: h.status === 'fulfilled' && Array.isArray(h.value) ? h.value.length : 0,
            mantenimiento: m.status === 'fulfilled' && Array.isArray(m.value) ? m.value.length : 0,
            streaming: s.status === 'fulfilled' && Array.isArray(s.value) ? s.value.length : 0,
        });
        if (h.status === 'fulfilled') setHomeData(Array.isArray(h.value) ? h.value : []);
        if (m.status === 'fulfilled') setMantData(Array.isArray(m.value) ? m.value : []);
        if (s.status === 'fulfilled') setStreamData(Array.isArray(s.value) ? s.value : []);
    }, []);

    useEffect(() => { if (authed) { loadAll(); loadBanner(); } }, [authed, loadAll]);

    // ── Load banner ──
    const loadBanner = async () => {
        try {
            const res = await fetch('/api/admin/banner');
            if (res.ok) { const d = await res.json(); if (d) { setBanner(d); setBannerLoaded(true); } }
        } catch { }
    };

    const saveBanner = async () => {
        setBannerSaving(true);
        try {
            const res = await fetch('/api/admin/banner', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(banner) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            showToast('✅ Banner actualizado — se verá en la página principal');
        } catch (e: any) { showToast(`❌ Error: ${e.message}`, false); }
        finally { setBannerSaving(false); }
    };

    const bSet = (key: string, val: string) => setBanner(b => ({ ...b, [key]: val }));

    // ── Navigate ──
    const goTo = (s: Section) => { setSection(s); setMenuOpen(false); setSearch(''); setDelConfirm(null); };

    // ── Modal open ──
    const openNew = () => {
        setEditing(null);
        const defaults: Record<string, string> = section === 'streaming'
            ? { nombre: '', descripcion: '', precio: '', imagen_url: '', plataforma: 'Netflix', duracion: '1 mes' }
            : section === 'inicio'
                ? { nombre: '', descripcion: '', precio: '', imagen_url: '', categoria: 'Juego', posicion: '' }
                : { nombre: '', descripcion: '', precio: '', imagen_url: '', categoria: 'Componentes', tipo: '' };
        setForm(defaults);
        setInitialForm(defaults);
        setUsaVariantes(false);
        setVariants([{ label: '', value: '' }]);
        setInitialVariants([{ label: '', value: '' }]);
        setAddImgs([]);
        setInitialAddImgs([]);
        setModalOpen(true);
    };

    const openEdit = (p: any) => {
        setEditing(p);
        const vars = parseVariants(p.variantes_precio);
        setUsaVariantes(vars.length > 0);
        setVariants(vars.length > 0 ? vars : [{ label: '', value: '' }]);
        const base: Record<string, string | boolean> = {
            nombre: p.nombre ?? '', descripcion: p.descripcion ?? '',
            precio: p.precio ?? '', imagen_url: p.imagen_url ?? '',
            destacado: p.destacado ?? false, agotado: p.agotado ?? false,
        };
        if (section === 'streaming') { base.plataforma = p.plataforma ?? 'Netflix'; base.duracion = p.duracion ?? '1 mes'; }
        if (section === 'inicio') { base.categoria = p.categoria ?? 'Juego'; base.posicion = String(p.posicion ?? ''); }
        if (section === 'mantenimiento') { base.categoria = p.categoria ?? 'Componentes'; base.tipo = p.tipo ?? ''; }
        
        const ia = parseImages(p.imagenes_adicionales);
        setAddImgs(ia);
        setInitialAddImgs(ia);

        setForm(base as any);
        setInitialForm(base as any);
        setInitialVariants(vars.length > 0 ? vars : [{ label: '', value: '' }]);
        setModalOpen(true);
    };

    const closeModal = (checkChanges = false) => {
        if (checkChanges) {
            const hasFormChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
            const hasVariantChanges = usaVariantes && JSON.stringify(variants) !== JSON.stringify(initialVariants);
            const hasImgChanges = JSON.stringify(addImgs) !== JSON.stringify(initialAddImgs);
            if (hasFormChanges || hasVariantChanges || hasImgChanges) {
                const confirm = window.confirm('¿Estás seguro de que deseas salir? Se perderán los datos no guardados');
                if (!confirm) return;
            }
        }
        setModalOpen(false);
        setEditing(null);
    };

    // ── Save ──
    const save = async () => {
        if (!form.nombre?.trim()) return showToast('⚠️ El nombre es obligatorio', false);
        setSaving(true);
        try {
            const varJson = usaVariantes ? buildVariantsJSON(variants) : '';
            const validImgs = addImgs.filter(u => u.trim());
            const body: any = { 
                ...form, 
                variantes_precio: varJson || null, 
                precio: !usaVariantes && form.precio ? form.precio : null,
                imagenes_adicionales: validImgs
            };
            if (body.posicion === '') delete body.posicion;

            const meta = SECTION_META[section as keyof typeof SECTION_META];
            const url = editing ? `${meta.api}/${editing.id}` : meta.api;
            const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            showToast(editing ? '✅ Guardado correctamente' : '✅ Producto creado');
            closeModal();
            loadAll();
        } catch (e: any) { showToast(`❌ Error: ${e.message}`, false); }
        finally { setSaving(false); }
    };

    // ── Delete ──
    const del = async (id: number) => {
        try {
            const meta = SECTION_META[section as keyof typeof SECTION_META];
            await fetch(`${meta.api}/${id}`, { method: 'DELETE' });
            showToast('🗑️ Eliminado');
            setDelConfirm(null);
            loadAll();
        } catch { showToast('❌ Error al eliminar', false); }
    };

    // ── Move position ──
    const moveItem = async (productList: any[], index: number, dir: 'up' | 'down') => {
        const targetIdx = dir === 'up' ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= productList.length) return;

        const a = productList[index];
        const b = productList[targetIdx];
        const posA = a.posicion ?? index + 1;
        const posB = b.posicion ?? targetIdx + 1;

        const meta = SECTION_META[section as keyof typeof SECTION_META];
        try {
            await Promise.all([
                fetch(`${meta.api}/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posicion: posB }) }),
                fetch(`${meta.api}/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posicion: posA }) }),
            ]);
            showToast('↕️ Orden actualizado');
            loadAll();
        } catch { showToast('❌ Error al reordenar', false); }
    };

    const setPosDirectly = async (id: number, newPos: number) => {
        const meta = SECTION_META[section as keyof typeof SECTION_META];
        try {
            await fetch(`${meta.api}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posicion: newPos }) });
            showToast('📍 Posición actualizada');
            loadAll();
        } catch { showToast('❌ Error', false); }
    };

    // ── Computed data (ordered by posicion) ──
    const currentList = section === 'inicio' ? homeData : section === 'streaming' ? streamData : mantData;
    const currentData = Array.isArray(currentList) ? currentList.slice().sort((a: any, b: any) => (a.posicion ?? 9999) - (b.posicion ?? 9999)) : [];
    const filtered = currentData.filter((p: any) => !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || (p.tipo ?? p.plataforma ?? '').toLowerCase().includes(search.toLowerCase()));

    // ════════════════════════════════════════════════════════
    // LOGIN
    // ════════════════════════════════════════════════════════
    if (!authed) return (
        <div style={{ ...S.page, paddingTop: 100, paddingLeft: 20, paddingRight: 20 }}>
            <div style={{ ...S.card, maxWidth: 380, margin: '0 auto', padding: 32 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🔐</div>
                    <h1 style={{ ...S.h1, fontSize: 20 }}>Panel de Administración</h1>
                    <p style={S.muted}>GeekTech — Solo para administradores</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={S.label}>Contraseña de acceso</label>
                    <input type="password" value={pw} placeholder="••••••••"
                        onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
                        style={{ ...S.input, fontSize: 16, padding: '14px 16px' }} />
                    {pwErr && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>⚠️ {pwErr}</p>}
                    <button onClick={login} style={{ ...S.btn('#8b5cf6'), padding: '14px', fontSize: 16, marginTop: 8 }}>
                        Entrar
                    </button>
                </div>
            </div>
        </div>
    );

    // ════════════════════════════════════════════════════════
    // LAYOUT
    // ════════════════════════════════════════════════════════
    return (
        <div style={{ ...S.page, paddingTop: 72 }}>

            {/* Toast */}
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '13px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: toast.ok ? '#065f46' : '#7f1d1d', border: `1px solid ${toast.ok ? '#10b981' : '#ef4444'}`, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>{toast.msg}</div>}

            {/* HEADER MÓVIL */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#17171f] sticky top-[72px] z-[50]">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
                    <div>
                        <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0 }}>GeekTech</p>
                        <p style={{ color: '#6b7280', fontSize: 10, margin: 0 }}>Admin Panel</p>
                    </div>
                </div>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', padding: 4 }}>
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            <div className={`max-w-full mx-auto p-4 md:p-8 flex flex-col md:grid md:grid-cols-[260px_1fr] md:gap-8 gap-6 items-start relative`}>

                {/* ── SIDEBAR ── */}
                <aside className={`${menuOpen ? 'block' : 'hidden'} md:block md:sticky md:top-[82px] w-full z-40`} style={{ ...S.card, padding: 24 }}>
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12, marginBottom: 28, padding: '4px 0' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⚡</div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>GeekTech</p>
                            <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>Admin Panel</p>
                        </div>
                    </div>

                    <p style={{ ...S.label, marginBottom: 12, paddingLeft: 4 }}>Secciones</p>
                    {([
                        { key: 'dashboard', icon: '📊', label: 'Resumen general' },
                        { key: 'banner', icon: '🖼️', label: 'Banner Principal' },
                        { key: 'inicio', icon: '🎮', label: 'Inicio & Juegos' },
                        { key: 'mantenimiento', icon: '🔧', label: 'Mantenimiento y Tienda' },
                        { key: 'streaming', icon: '📺', label: 'Streaming' },
                    ] as const).map(item => (
                        <button key={item.key} onClick={() => goTo(item.key)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                padding: '13px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: section === item.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                                color: section === item.key ? '#a78bfa' : '#9ca3af',
                                fontWeight: section === item.key ? 700 : 500, fontSize: 15,
                                textAlign: 'left', transition: 'all 0.15s',
                                borderLeft: section === item.key ? '3px solid #8b5cf6' : '3px solid transparent',
                                marginBottom: 4,
                            }}>
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}

                    <div style={{ marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                        <button onClick={() => setAuthed(false)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                            🚪 Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main>

                    {/* ===== DASHBOARD ===== */}
                    {section === 'dashboard' && (
                        <div>
                            <h1 style={{ ...S.h1, marginBottom: 6 }}>👋 Bienvenido al Panel</h1>
                            <p style={{ ...S.muted, marginBottom: 32 }}>Desde aquí puedes agregar, editar y eliminar todos los productos de tu tienda.</p>

                            {/* Stats cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

                                {/* Banner card — full width destacado */}
                                <button onClick={() => goTo('banner')}
                                    style={{ ...S.card, padding: '24px', cursor: 'pointer', border: '2px solid #f59e0b40', textAlign: 'left', background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.04))', gridColumn: '1 / -1', transition: 'border-color 0.2s' }}>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                        <div style={{ fontSize: 44 }}>🖼️</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>✨ Banner Principal</div>
                                            <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5 }}>Cambia el título, subtítulo, botón e imagen del banner que ven tus clientes al entrar al sitio. Los cambios se aplican al instante.</div>
                                        </div>
                                        <div style={{ padding: '10px 20px', borderRadius: 12, background: '#f59e0b20', color: '#fbbf24', fontWeight: 700, fontSize: 14, border: '1px solid #f59e0b40', whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'flex-start' }}>✏️ Editar Banner →</div>
                                    </div>
                                </button>

                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
                                {([
                                    { key: 'inicio', label: 'Inicio & Juegos', icon: '🎮', color: '#a855f7', desc: 'Productos en el inicio' },
                                    { key: 'mantenimiento', label: 'Mantenimiento y Tienda', icon: '🔧', color: '#8b5cf6', desc: 'Componentes & Servicios' },
                                    { key: 'streaming', label: 'Streaming', icon: '📺', color: '#10b981', desc: 'Cuentas & Plataformas' },
                                ] as const).map(s => (
                                    <button key={s.key} onClick={() => goTo(s.key)}
                                        style={{ ...S.card, padding: 28, cursor: 'pointer', border: `1px solid ${s.color}30`, textAlign: 'left', background: `${s.color}08` }}>
                                        <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                                        <div style={{ fontSize: 48, fontWeight: 800, color: s.color, lineHeight: 1 }}>{counts[s.key]}</div>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginTop: 8 }}>{s.label}</div>
                                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{s.desc}</div>
                                        <div style={{ marginTop: 16, fontSize: 13, color: s.color, fontWeight: 600 }}>Ir a gestionar →</div>
                                    </button>
                                ))}
                            </div>

                            {/* Quick guide */}
                            <div style={S.card}>
                                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📖 Guía rápida</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                    {[
                                        { n: '1', t: 'Elige una sección', d: 'Haz clic en el menú izquierdo: Inicio, Mantenimiento y Tienda o Streaming.' },
                                        { n: '2', t: 'Agrega un producto', d: 'Pulsa el botón verde "+ Agregar". Rellena el formulario y guarda.' },
                                        { n: '3', t: 'Edita o elimina', d: 'Cada producto tiene botones ✏️ para editar y 🗑️ para eliminar.' },
                                        { n: '4', t: 'Los cambios son inmediatos', d: 'Al guardar, la tienda se actualiza al instante para tus clientes.' },
                                    ].map(step => (
                                        <div key={step.n} style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{step.n}</div>
                                            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>{step.t}</p>
                                            <p style={{ color: '#6b7280', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{step.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== BANNER SECTION ===== */}
                    {section === 'banner' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                                <div>
                                    <h1 style={{ ...S.h1, marginBottom: 4 }}>🖼️ Banner Principal</h1>
                                    <p style={S.muted}>Estos textos e imagen aparecen en la pantalla principal de tu tienda.</p>
                                </div>
                                <button onClick={saveBanner} disabled={bannerSaving}
                                    style={{ ...S.btn('#f59e0b'), opacity: bannerSaving ? 0.7 : 1, fontSize: 15, padding: '12px 28px' }}>
                                    {bannerSaving ? '⏳ Guardando...' : '💾 Guardar cambios'}
                                </button>
                            </div>

                            {/* Live preview */}
                            <div style={{ marginBottom: 28, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', position: 'relative', minHeight: 160, background: '#0a0a0f' }}>
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                                    <img src={banner.imagen_url || '/img/principal/banner.svg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/principal/banner.svg'; }} />
                                </div>
                                <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>👁️ VISTA PREVIA EN TIEMPO REAL</div>
                                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 8px', lineHeight: 1.3 }}>{banner.titulo || '...'}</h2>
                                        <p style={{ color: '#9ca3af', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>{banner.subtitulo || '...'}</p>
                                        <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                                            {banner.btn_texto || 'Botón'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 24 }}>{banner.badge1_icon}</div>
                                            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{banner.badge1_text}</div>
                                        </div>
                                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 24 }}>{banner.badge2_icon}</div>
                                            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{banner.badge2_text}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div style={{ ...S.card, padding: 24, gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>📝 Textos principales</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <Fld label="Título principal (grande)">
                                            <input value={banner.titulo} onChange={e => bSet('titulo', e.target.value)}
                                                placeholder="Ej: Productos Digitales Sin Límites" style={S.input} />
                                        </Fld>
                                        <Fld label="Subtítulo (texto debajo del título)">
                                            <textarea value={banner.subtitulo} onChange={e => bSet('subtitulo', e.target.value)}
                                                rows={2} placeholder="Descripción corta..." style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }} />
                                        </Fld>
                                    </div>
                                </div>

                                <div style={{ ...S.card, padding: 24 }}>
                                    <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>🔘 Botón</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <Fld label="Texto del botón">
                                            <input value={banner.btn_texto} onChange={e => bSet('btn_texto', e.target.value)}
                                                placeholder="Ej: Ver Productos" style={S.input} />
                                        </Fld>
                                        <Fld label="¿A dónde lleva el botón?">
                                            <select value={banner.btn_link} onChange={e => bSet('btn_link', e.target.value)} style={S.select}>
                                                <option value="/mantenimiento-componentes">Mantenimiento y Tienda</option>
                                                <option value="/cuentas-streaming">Streaming</option>
                                                <option value="/">Inicio</option>
                                            </select>
                                        </Fld>
                                    </div>
                                </div>

                                <div style={{ ...S.card, padding: 24 }}>
                                    <p style={{ color: '#10b981', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>🏷️ Badges (tarjetas flotantes)</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <Fld label="Badge 1 — Ícono (emoji)">
                                            <input value={banner.badge1_icon} onChange={e => bSet('badge1_icon', e.target.value)}
                                                placeholder="🚀" style={{ ...S.input, fontSize: 22 }} />
                                        </Fld>
                                        <Fld label="Badge 1 — Texto">
                                            <input value={banner.badge1_text} onChange={e => bSet('badge1_text', e.target.value)}
                                                placeholder="Rápido" style={S.input} />
                                        </Fld>
                                        <Fld label="Badge 2 — Ícono (emoji)">
                                            <input value={banner.badge2_icon} onChange={e => bSet('badge2_icon', e.target.value)}
                                                placeholder="⚡" style={{ ...S.input, fontSize: 22 }} />
                                        </Fld>
                                        <Fld label="Badge 2 — Texto">
                                            <input value={banner.badge2_text} onChange={e => bSet('badge2_text', e.target.value)}
                                                placeholder="Entrega Inmediata" style={S.input} />
                                        </Fld>
                                    </div>
                                </div>

                                <div style={{ ...S.card, padding: 24, gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#f472b6', fontWeight: 700, fontSize: 14, margin: '0 0 8px' }}>🖼️ Imagen de fondo</p>
                                    <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 14px' }}>Pega la URL de una imagen (puede ser de internet). Si la dejas vacía, usa el banner por defecto.</p>
                                    <input value={banner.imagen_url} onChange={e => bSet('imagen_url', e.target.value)}
                                        placeholder="https://... o /img/principal/banner.svg" style={S.input} />
                                </div>

                                {/* ===== MANTENIMIENTO BANNER ===== */}
                                <div style={{ ...S.card, padding: 24, gridColumn: '1 / -1', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                        <div style={{ fontSize: 24 }}>🔧</div>
                                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Banner de Mantenimiento</h2>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                                        <Fld label="Título (Mantenimiento)">
                                            <input value={banner.mant_titulo} onChange={e => bSet('mant_titulo', e.target.value)}
                                                placeholder="Ej: Mantenimiento Profesional de PC" style={S.input} />
                                        </Fld>
                                        <Fld label="Texto del botón">
                                            <input value={banner.mant_btn_texto} onChange={e => bSet('mant_btn_texto', e.target.value)}
                                                placeholder="Ej: AGENDAR CITA" style={S.input} />
                                        </Fld>
                                        <Fld label="Mensaje de WhatsApp">
                                            <input value={banner.mant_msg_whatsapp} onChange={e => bSet('mant_msg_whatsapp', e.target.value)}
                                                placeholder="Ej: Hola! Quisiera agendar..." style={S.input} />
                                        </Fld>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <Fld label="Subtítulo / Descripción">
                                                <textarea value={banner.mant_subtitulo} onChange={e => bSet('mant_subtitulo', e.target.value)}
                                                    rows={3} placeholder="Describe el servicio..." style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }} />
                                            </Fld>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <Fld label="URL de imagen del Banner Mantenimiento">
                                                <input value={banner.mant_imagen_url} onChange={e => bSet('mant_imagen_url', e.target.value)}
                                                    placeholder="https://... o /img/maintenance.jpg" style={S.input} />
                                            </Fld>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Save bottom */}
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={saveBanner} disabled={bannerSaving}
                                    style={{ ...S.btn('#f59e0b'), opacity: bannerSaving ? 0.7 : 1, fontSize: 15, padding: '14px 36px' }}>
                                    {bannerSaving ? '⏳ Guardando...' : '💾 Guardar cambios en el Banner'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== PRODUCT SECTIONS ===== */}
                    {section !== 'dashboard' && section !== 'banner' && (() => {
                        const meta = SECTION_META[section];
                        return (
                            <div>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                                    <div>
                                        <h1 style={{ ...S.h1, marginBottom: 4 }}>{meta.icon} {meta.label}</h1>
                                        <p style={S.muted}>{filtered.length} de {currentData.length} productos</p>
                                    </div>
                                    <button onClick={openNew} style={S.btn('#8b5cf6')}>+ Agregar producto</button>
                                </div>

                                {/* Search */}
                                <input type="text" placeholder="🔍 Buscar por nombre..." value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ ...S.input, width: '100%', marginBottom: 20, boxSizing: 'border-box', padding: '12px 16px', fontSize: 15 }} />

                                {/* Category chips — mantenimiento only */}
                                {section === 'mantenimiento' && (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                        {['todo', ...MANT_CATS].map(c => {
                                            const count = c === 'todo' ? mantData.length : mantData.filter(p => p.categoria === c).length;
                                            return (
                                                <button key={c} onClick={() => setSearch(c === 'todo' ? '' : c)}
                                                    style={{ padding: '7px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                                                    {c === 'todo' ? '🗂️ Todos' : c} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Loading */}
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>⏳ Cargando...</div>
                                ) : filtered.length === 0 ? (
                                    <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
                                        <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                                        <p style={S.muted}>No hay productos aquí todavía.</p>
                                        <button onClick={openNew} style={{ ...S.btn('#8b5cf6'), marginTop: 12 }}>+ Agregar el primero</button>
                                    </div>
                                ) : (
                                    /* Product list */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {filtered.map((p: any, idx: number) => {
                                            const vars = parseVariants(p.variantes_precio);
                                            const badge = p.plataforma ?? p.categoria ?? p.tipo ?? '';
                                            const badgeColor = { Mantenimiento: '#a78bfa', Componentes: '#10b981', Laptops: '#3b82f6', Accesorios: '#f472b6', Netflix: '#e50914', Spotify: '#1db954' }[badge] ?? meta.color;
                                            const isFirst = idx === 0;
                                            const isLast = idx === filtered.length - 1;
                                            return (
                                                <div key={p.id} style={{ ...S.card, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', opacity: p.agotado ? 0.6 : 1, filter: p.agotado ? 'grayscale(0.8)' : 'none' }}>

                                                    {/* ── Posición controles ── */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                                        <button
                                                            onClick={() => moveItem(filtered, idx, 'up')}
                                                            disabled={isFirst}
                                                            title="Subir"
                                                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: isFirst ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.15)', color: isFirst ? '#374151' : '#a78bfa', cursor: isFirst ? 'not-allowed' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >▲</button>
                                                        <PosInput
                                                            value={p.posicion ?? idx + 1}
                                                            onSave={(v) => setPosDirectly(p.id, v)}
                                                        />
                                                        <button
                                                            onClick={() => moveItem(filtered, idx, 'down')}
                                                            disabled={isLast}
                                                            title="Bajar"
                                                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: isLast ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.15)', color: isLast ? '#374151' : '#a78bfa', cursor: isLast ? 'not-allowed' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >▼</button>
                                                    </div>

                                                    {/* Thumb */}
                                                    <div style={{ width: 68, height: 68, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <img src={p.imagen_url || '/img/placeholder.jpg'} alt={p.nombre}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/img/placeholder.jpg'; }} />
                                                    </div>

                                                    {/* Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                                                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{p.nombre}</span>
                                                            {p.destacado && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2430', fontWeight: 700 }}>🌟 DESTACADO</span>}
                                                            {p.agotado && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444430', fontWeight: 700 }}>⛔ AGOTADO</span>}
                                                            {badge && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30`, fontWeight: 600 }}>{badge}</span>}
                                                            {p.duracion && <span style={{ fontSize: 11, color: '#6b7280' }}>· {p.duracion}</span>}
                                                        </div>
                                                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                                                            {vars.length > 0
                                                                ? `${vars.length} opciones`
                                                                : p.precio ? `Bs ${parseFloat(p.precio).toFixed(2)}` : 'Sin precio definido'}
                                                            {p.descripcion && <span style={{ marginLeft: 10 }}>· {p.descripcion.slice(0, 55)}{p.descripcion.length > 55 ? '…' : ''}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    {delConfirm === p.id ? (
                                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                            <span style={{ color: '#f87171', fontSize: 13, whiteSpace: 'nowrap' }}>¿Eliminar?</span>
                                                            <button onClick={() => del(p.id)} style={S.btn('#ef4444', 'sm')}>Sí</button>
                                                            <button onClick={() => setDelConfirm(null)} style={S.btn('#374151', 'sm')}>No</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button onClick={() => { setQuickView(p); setQuickViewImg(p.imagen_url || '/img/placeholder.jpg'); }} style={S.btn('#1f2937', 'sm')}>👁️ Vista rápida</button>
                                                            <button onClick={() => openEdit(p)} style={S.btn('#3b82f6', 'sm')}>✏️ Editar</button>
                                                            <button onClick={() => setDelConfirm(p.id)} style={S.btn('#374151', 'sm')}>🗑️</button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </main>
            </div>

            {/* ════════════ MODAL ════════════ */}
            {modalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={e => { if (e.target === e.currentTarget) closeModal(true); }}>
                    <div style={{ ...S.card, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>
                                {editing ? '✏️ Editar producto' : '➕ Nuevo producto'}
                            </h2>
                            <button onClick={() => closeModal(true)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            {/* Nombre */}
                            <Fld label="Nombre del producto *">
                                <input value={form.nombre ?? ''} onChange={e => f('nombre', e.target.value)} placeholder="Ej: Netflix Premium 1 mes" style={S.input} />
                            </Fld>

                            {/* Campos específicos por sección */}
                            {section === 'streaming' && (<>
                                <Fld label="Plataforma">
                                    <select value={form.plataforma ?? 'Netflix'} onChange={e => f('plataforma', e.target.value)} style={S.select}>
                                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </Fld>
                                <Fld label="Duración">
                                    <select value={form.duracion ?? '1 mes'} onChange={e => f('duracion', e.target.value)} style={S.select}>
                                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Fld>
                            </>)}

                            {section === 'mantenimiento' && (<>
                                <Fld label="Categoría">
                                    <select value={form.categoria ?? 'Componentes'} onChange={e => f('categoria', e.target.value)} style={S.select}>
                                        {MANT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Fld>
                                <Fld label="Tipo (ej: Mouse, RAM, Servicio...)">
                                    <input value={form.tipo ?? ''} onChange={e => f('tipo', e.target.value)} placeholder="Ej: Teclado, SSD, Limpieza..." style={S.input} />
                                </Fld>
                            </>)}

                            {section === 'inicio' && (
                                <Fld label="Categoría / Género">
                                    <input value={form.categoria ?? ''} onChange={e => f('categoria', e.target.value)} placeholder="Ej: Juego, Licencia, Software..." style={S.input} />
                                </Fld>
                            )}

                            {/* Descripción */}
                            <Fld label="Descripción (opcional)">
                                <textarea value={form.descripcion ?? ''} onChange={e => f('descripcion', e.target.value)}
                                    placeholder="Describe brevemente el producto..." rows={3}
                                    style={{ ...S.input, resize: 'vertical', fontFamily: 'inherit' }} />
                            </Fld>

                            {/* Toggle precio */}
                            <Fld label="Tipo de precio">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setUsaVariantes(false)} style={{ ...S.btn(usaVariantes ? '#1f2937' : '#8b5cf6', 'sm'), flex: 1 }}>💰 Precio único</button>
                                    <button onClick={() => setUsaVariantes(true)} style={{ ...S.btn(usaVariantes ? '#8b5cf6' : '#1f2937', 'sm'), flex: 1 }}>📋 Varias opciones</button>
                                </div>
                            </Fld>

                            {!usaVariantes ? (
                                <Fld label="Precio en Bolivianos (Bs)">
                                    <input type="number" min="0" step="0.01" value={form.precio ?? ''}
                                        onChange={e => f('precio', e.target.value)} placeholder="Ej: 25.00" style={S.input} />
                                </Fld>
                            ) : (
                                <Fld label="Opciones de precio">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {variants.map((v, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <input value={v.label} onChange={e => setVariants(vs => vs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                                                    placeholder={`Opción ${i + 1} — ej: 8GB, 1 mes, Pro...`}
                                                    style={{ ...S.input, flex: 2 }} />
                                                <input value={v.value} onChange={e => setVariants(vs => vs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                                                    placeholder="Precio (Ej: 25 o texto)" style={{ ...S.input, flex: 1 }} />
                                                {variants.length > 1 && <button onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))} style={{ color: '#f87171', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>}
                                            </div>
                                        ))}
                                        <button onClick={() => setVariants(vs => [...vs, { label: '', value: '' }])}
                                            style={{ ...S.btn('#1f2937', 'sm'), alignSelf: 'flex-start' }}>+ Añadir opción</button>
                                    </div>
                                </Fld>
                            )}

                            {/* Imagen */}
                            <Fld label="URL de la imagen PRINCIPAL (opcional)">
                                <input value={form.imagen_url ?? ''} onChange={e => f('imagen_url', e.target.value)}
                                    placeholder="https://... (deja vacío para imagen por defecto)" style={S.input} />
                            </Fld>

                            <Fld label="Imágenes adicionales (para vista rápida)">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {addImgs.map((url, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <input value={url} onChange={e => setAddImgs(l => l.map((vl, j) => j === i ? e.target.value : vl))}
                                                placeholder="https://... URL de imagen"
                                                style={{ ...S.input, flex: 1 }} />
                                            <button onClick={() => setAddImgs(l => l.filter((_, j) => j !== i))} style={{ color: '#f87171', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddImgs(l => [...l, ''])}
                                        style={{ ...S.btn('#1f2937', 'sm'), alignSelf: 'flex-start' }}>+ Añadir otra foto</button>
                                </div>
                            </Fld>

                            <Fld label="Estado del producto">
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <input type="checkbox" checked={!!form.destacado} onChange={e => setForm(p => ({ ...p, destacado: e.target.checked } as any))} 
                                            style={{ width: 18, height: 18, accentColor: '#fbbf24' }} />
                                        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>🌟 Mostrar primero (Destacado)</span>
                                    </label>
                                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <input type="checkbox" checked={!!form.agotado} onChange={e => setForm(p => ({ ...p, agotado: e.target.checked } as any))} 
                                            style={{ width: 18, height: 18, accentColor: '#ef4444' }} />
                                        <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 600 }}>⛔ Marcar como Agotado</span>
                                    </label>
                                </div>
                            </Fld>
                        </div>

                        {/* Footer modal */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                            <button onClick={() => closeModal(true)} style={{ ...S.btn('#374151'), flex: 1 }}>Cancelar</button>
                            <button onClick={save} disabled={saving} style={{ ...S.btn('#8b5cf6'), flex: 2, opacity: saving ? 0.7 : 1 }}>
                                {saving ? '⏳ Guardando...' : editing ? '✅ Guardar cambios' : '✅ Crear producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════ MODAL VISTA RÁPIDA ════════════ */}
            {quickView && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9995, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={e => { if (e.target === e.currentTarget) setQuickView(null); }}>
                    <div style={{ ...S.card, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setQuickView(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>×</button>
                            
                            <div style={{ width: '100%', height: 300, background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={quickViewImg} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Preview" />
                            </div>

                            {/* Miniaturas */}
                            <div style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <button onClick={() => setQuickViewImg(quickView.imagen_url || '/img/placeholder.jpg')} 
                                    style={{ width: 60, height: 60, borderRadius: 8, padding: 0, border: `2px solid ${quickViewImg === (quickView.imagen_url || '/img/placeholder.jpg') ? '#8b5cf6' : 'transparent'}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, background: '#0a0a0f' }}>
                                    <img src={quickView.imagen_url || '/img/placeholder.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                                {parseImages(quickView.imagenes_adicionales).map((imgUrl, i) => (
                                    <button key={i} onClick={() => setQuickViewImg(imgUrl)} 
                                        style={{ width: 60, height: 60, borderRadius: 8, padding: 0, border: `2px solid ${quickViewImg === imgUrl ? '#8b5cf6' : 'transparent'}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, background: '#0a0a0f' }}>
                                        <img src={imgUrl} onError={e => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: 24 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                                {quickView.destacado && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2430', fontWeight: 700 }}>DESTACADO</span>}
                                {quickView.categoria && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 }}>{quickView.categoria}</span>}
                                {quickView.tipo && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 }}>{quickView.tipo}</span>}
                                {quickView.plataforma && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: '#e5091420', color: '#e50914', border: '1px solid #e5091430', fontWeight: 700 }}>{quickView.plataforma}</span>}
                            </div>
                            
                            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>{quickView.nombre}</h2>
                            <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>{quickView.descripcion || 'Sin descripción'}</p>

                            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Precio / Variantes</div>
                                {parseVariants(quickView.variantes_precio).length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {parseVariants(quickView.variantes_precio).map((v, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                                                <span style={{ color: '#fff' }}>{v.label}</span>
                                                <span style={{ color: '#10b981', fontWeight: 700 }}>{v.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 20, color: '#10b981', fontWeight: 800 }}>
                                        {quickView.precio ? `Bs ${parseFloat(quickView.precio).toFixed(2)}` : 'Consulte precio'}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Field wrapper ────────────────────────────────────────────
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>{label}</label>
            {children}
        </div>
    );
}

// ── PosInput — editable position number ──────────────────────
function PosInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(String(value));

    const commit = () => {
        const n = parseInt(local);
        if (!isNaN(n) && n > 0) onSave(n);
        else setLocal(String(value));
        setEditing(false);
    };

    if (editing) return (
        <input
            type="number" min="1" value={local} autoFocus
            onChange={e => setLocal(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setLocal(String(value)); setEditing(false); } }}
            style={{ width: 44, textAlign: 'center', padding: '3px 4px', borderRadius: 6, background: '#0f0f12', border: '1px solid #8b5cf6', color: '#a78bfa', fontSize: 13, fontWeight: 700, outline: 'none' }}
        />
    );
    return (
        <button
            onClick={() => { setLocal(String(value)); setEditing(true); }}
            title="Clic para cambiar posición"
            style={{ width: 28, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#9ca3af', fontSize: 12, fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}
        >{value}</button>
    );
}

// ── Shared styles ─────────────────────────────────────────────
const S = {
    page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' } as React.CSSProperties,
    card: { background: '#17171f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 } as React.CSSProperties,
    h1: { fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 } as React.CSSProperties,
    muted: { color: '#6b7280', fontSize: 13, margin: 0 } as React.CSSProperties,
    label: { color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', margin: 0 },
    input: { width: '100%', padding: '9px 13px', borderRadius: 10, background: '#0f0f12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
    select: { width: '100%', padding: '9px 13px', borderRadius: 10, background: '#0f0f12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const },
    btn: (bg: string, size?: 'sm') => ({
        background: bg, color: '#fff', border: 'none', borderRadius: 10,
        padding: size === 'sm' ? '7px 14px' : '10px 20px',
        fontSize: size === 'sm' ? 13 : 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
    }),
};
