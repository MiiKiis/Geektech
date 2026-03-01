import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';

export const metadata: Metadata = {
    metadataBase: new URL('https://geektech.onl'),
    title: {
        template: '%s | GeekTech Store',
        default: 'GeekTech Store - Software, Hardware y Servicios Premium',
    },
    description: 'La mejor tienda de licencias de software, hardware gamer, cuentas de streaming y tarjetas de regalo en Bolivia.',
    keywords: ['software', 'windows', 'office', 'antivirus', 'streaming', 'netflix', 'spotify', 'hardware', 'bolivia', 'tecnologia', 'geek', 'store'],
    authors: [{ name: 'GeekTech' }],
    creator: 'GeekTech Team',
    openGraph: {
        type: 'website',
        locale: 'es_BO',
        url: 'https://geektech.onl',
        siteName: 'GeekTech Store',
        title: 'GeekTech Store - Lo mejor en tecnología y servicios digitales',
        description: 'Encuentra las mejores ofertas en licencias originales, cuentas premium y hardware de alta gama.',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'GeekTech Store Banner' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GeekTech Store',
        description: 'Tecnología y servicios digitales premium en Bolivia.',
        images: ['/images/og-image.jpg'],
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'GeekTech Store',
        image: 'https://geektech.bo/images/logo.png',
        description: 'Tienda líder en venta de software, hardware y servicios digitales.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Av. 6 de marzo',
            addressLocality: 'La Paz,El Alto',
            addressCountry: 'BO'
        },
        priceRange: '$$',
        url: 'https://geektech.onl'
    };

    return (
        <html lang="es" className="dark" style={{ colorScheme: 'dark' }} data-theme="dark" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="/css/styles.css?v=2" />
            </head>
            <body className="bg-[#0f0f12] text-white antialiased" suppressHydrationWarning>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <CartProvider>
                    <div className="app-wrapper">
                        <Header />
                        {children}
                        <Footer />
                        <CartSidebar />
                    </div>
                </CartProvider>
            </body>
        </html>
    );
}
