import { Metadata } from 'next';
import HeroBanner from './components/HeroBanner';

export const metadata: Metadata = {
    title: 'GeekTech Store - Productos Digitales y Servicios Premium',
    description: 'Tienda online de productos digitales en Bolivia: licencias, software, cuentas premium y servicios especializados. Mantenimiento y streaming con gestion dedicada.',
    keywords: ['geektech', 'tienda digital bolivia', 'software', 'licencias originales', 'cuentas streaming', 'mantenimiento pc'],
    openGraph: {
        title: 'GeekTech Store - Lo mejor en tecnología y servicios digitales',
        description: 'Tienda online de productos digitales en Bolivia con servicio premium y soporte dedicado.',
        url: 'https://geektech.onl',
        type: 'website',
    }
};

import StoreSection from './components/StoreSection';

export default function Home() {
    return (
        <main className="home-shell">
            <HeroBanner />
            <StoreSection />
        </main>
    );
}
