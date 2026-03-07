import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const category = resolvedParams?.category || '';

    const titles: Record<string, string> = {
        'tienda': 'Tienda',
        'juegos': 'Juegos Digitales',
        'mantenimiento-componentes': 'PC & Componentes',
        'cuentas-streaming': 'Cuentas Streaming',
        'streaming': 'Streaming',
        'home-game': 'Juegos Destacados',
    };

    const descriptions: Record<string, string> = {
        'tienda': 'Encuentra los mejores productos y licencias digitales en nuestra tienda.',
        'juegos': 'Compra juegos digitales para PC y consolas al mejor precio.',
        'mantenimiento-componentes': 'Lo mejor en hardware, accesorios y servicios para reparar tu PC.',
        'cuentas-streaming': 'Cuentas premium de Netflix, Spotify, Disney+ y más con garantía.',
        'home-game': 'Descubre nuestros juegos más populares y ofertas destacadas.',
    };

    const title = titles[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Categoría');
    const description = descriptions[category] || `Descubre los mejores productos en la categoría ${title} en GeekTech Store.`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: `${title} | GeekTech Store`,
            description: description,
            url: `https://geektech.onl/${category}`,
            type: 'website',
        },
        twitter: {
            title: `${title} | GeekTech Store`,
            description: description,
        }
    };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
