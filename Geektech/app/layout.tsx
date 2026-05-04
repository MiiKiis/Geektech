import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk, Sora } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';
import { Providers } from './providers';

const displayFont = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-display',
    weight: ['500', '700'],
});

const bodyFont = Sora({
    subsets: ['latin'],
    variable: '--font-body',
    weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://geektech.onl'),
    title: {
        template: '%s | GeekTech Store',
        default: 'GeekTech Store - Productos Digitales y Servicios Premium',
    },
    description: 'Tienda online de productos digitales en Bolivia: licencias, software, cuentas premium y servicios especializados. Mantenimiento y streaming con gestion dedicada.',
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
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://geektech.onl/#website',
                'url': 'https://geektech.onl/',
                'name': 'GeekTech Store',
                'description': 'La mejor tienda tecnológica en Bolivia. Encuentra licencias de software, componentes de PC, servicio técnico y cuentas de streaming.',
                'potentialAction': [{
                    '@type': 'SearchAction',
                    'target': 'https://geektech.onl/mantenimiento-componentes?search={search_term_string}',
                    'query-input': 'required name=search_term_string'
                }]
            },
            {
                '@type': 'Store',
                '@id': 'https://geektech.onl/#organization',
                'name': 'GeekTech Store',
                'url': 'https://geektech.onl/',
                'logo': 'https://geektech.onl/img/principal/logo.png',
                'image': 'https://geektech.onl/images/og-image.jpg',
                'description': 'Tienda líder en venta de software, hardware y servicios digitales en Bolivia.',
                'telephone': '+59168190472',
                'address': {
                    '@type': 'PostalAddress',
                    'streetAddress': 'Av. 6 de marzo',
                    'addressLocality': 'El Alto',
                    'addressRegion': 'La Paz',
                    'addressCountry': 'BO'
                },
                'priceRange': '$$'
            }
        ]
    };

    return (
        <html lang="es" className={`dark ${displayFont.variable} ${bodyFont.variable}`} style={{ colorScheme: 'dark' }} data-theme="dark" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="/css/styles.css?v=2" />
            </head>
            <body className="gt-dark-body antialiased" suppressHydrationWarning>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Providers>
                    <CartProvider>
                        <div className="app-wrapper">
                            <Header />
                            {children}
                            <Footer />
                            <CartSidebar />
                        </div>
                    </CartProvider>
                </Providers>
            </body>
        </html>
    );
}
