import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mantenimiento y Tienda',
    description: 'Servicio técnico especializado, componentes de calidad y laptops al mejor precio en Bolivia. Encuentra todo para tu PC.',
    keywords: ['mantenimiento', 'componentes pc', 'reparacion computadoras', 'laptops bolivia', 'servicio tecnico pc', 'hardware gamer', 'geektech'],
    openGraph: {
        title: 'Mantenimiento y Tienda | GeekTech Store',
        description: 'Servicio técnico especializado, componentes de calidad y laptops al mejor precio en Bolivia. Encuentra todo para tu PC.',
        url: 'https://geektech.onl/mantenimiento-componentes',
        type: 'website',
    },
    twitter: {
        title: 'Mantenimiento y Tienda | GeekTech Store',
        description: 'Servicio técnico, componentes de PC y laptops al mejor precio en Bolivia.',
    }
};

export default function MantenimientoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
