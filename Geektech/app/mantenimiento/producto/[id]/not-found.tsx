import Link from 'next/link';

export default function ProductNotFound() {
    return (
        <div style={{
            minHeight: '100vh', background: '#0f0f12',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif', paddingTop: '80px',
        }}>
            <div style={{
                textAlign: 'center', padding: '48px',
                background: '#17171f', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '24px', maxWidth: '400px',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                    Producto no encontrado
                </h1>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
                    El producto que buscas no existe o fue removido del catálogo.
                </p>
                <Link href="/mantenimiento-componentes" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: '#8b5cf6',
                    color: '#fff', fontWeight: 700, fontSize: '14px',
                    borderRadius: '12px', textDecoration: 'none',
                }}>
                    ← Volver al catálogo
                </Link>
            </div>
        </div>
    );
}
