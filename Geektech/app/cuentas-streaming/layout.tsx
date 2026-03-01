import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cuentas Streaming',
    description: 'Adquiere cuentas de Netflix, Spotify, Disney+, HBO Max, y más plataformas de streaming al mejor precio. Activación inmediata y garantizada.',
    keywords: ['cuentas streaming', 'netflix bolivia', 'spotify premium', 'disney plus bolivia', 'hbo max', 'cuentas premium', 'streaming barato'],
    openGraph: {
        title: 'Cuentas Streaming | GeekTech Store',
        description: 'Netflix, Spotify, Disney+, HBO Max y más. Activación inmediata.',
        url: 'https://geektech.onl/cuentas-streaming',
        type: 'website',
    },
    twitter: {
        title: 'Cuentas Streaming | GeekTech Store',
        description: 'Netflix, Spotify, Disney+, HBO Max y más. Activación inmediata.',
    }
};

export default function StreamingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
