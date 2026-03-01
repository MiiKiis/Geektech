export default function ProductLoading() {
    return (
        <div style={{
            minHeight: '100vh', background: '#0f0f12',
            paddingTop: '90px', paddingBottom: '60px',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
                {/* Breadcrumb skeleton */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                    {[80, 20, 140].map((w, i) => (
                        <div key={i} style={{
                            height: '14px', width: `${w}px`, borderRadius: '4px',
                            background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>

                {/* Card skeleton */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px',
                    background: '#17171f', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '24px', overflow: 'hidden', minHeight: '420px',
                }}>
                    {/* Image skeleton */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />

                    {/* Content skeleton */}
                    <div style={{ padding: '40px 40px 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ height: '36px', width: '80%', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: '16px', width: '100%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: '16px', width: '90%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: '16px', width: '70%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: '90px', borderRadius: '14px', background: 'rgba(139,92,246,0.06)', animation: 'pulse 1.5s ease-in-out infinite', marginTop: '8px' }} />
                        <div style={{ height: '48px', borderRadius: '12px', background: 'rgba(37,211,102,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                </div>
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        </div>
    );
}
