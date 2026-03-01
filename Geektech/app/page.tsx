import { Metadata } from 'next';
import HeroBanner from './components/HeroBanner';

export const metadata: Metadata = {
    title: 'GeekTech Store - Software, Hardware y Servicios Digitales Premium',
    description: 'La mejor tienda tecnológica en Bolivia. Encuentra licencias de software originales, componentes de PC, servicio técnico especializado y cuentas de streaming premium.',
    keywords: ['geektech', 'geektech store', 'tienda tecnologia bolivia', 'software', 'mantenimiento pc', 'componentes pc', 'licencias originales', 'cuentas streaming'],
    openGraph: {
        title: 'GeekTech Store - Lo mejor en tecnología y servicios digitales',
        description: 'La mejor tienda tecnológica en Bolivia. Encuentra licencias de software originales, componentes de PC, servicio técnico especializado y cuentas de streaming premium.',
        url: 'https://geektech.onl',
        type: 'website',
    }
};

import StoreSection from './components/StoreSection';

export default function Home() {
    return (
        <>
            <HeroBanner />
            <StoreSection />
        </>
    );
}
