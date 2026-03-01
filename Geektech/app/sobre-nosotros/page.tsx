import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sobre Nosotros',
    description: 'Conoce más sobre GeekTech, nuestra misión y por qué somos tu mejor opción en licencias y servicios digitales en Bolivia.',
    keywords: ['sobre nosotros geektech', 'quienes somos', 'historia geektech', 'mision y vision', 'empresa tecnologia bolivia'],
    openGraph: {
        title: 'Sobre Nosotros | GeekTech Store',
        description: 'Conoce más sobre GeekTech, nuestra misión y por qué somos tu mejor opción en licencias y servicios digitales.',
        url: 'https://geektech.onl/sobre-nosotros',
        type: 'website',
    },
    twitter: {
        title: 'Sobre Nosotros | GeekTech Store',
        description: 'Conoce más sobre GeekTech, nuestra misión y por qué somos tu mejor opción en licencias y servicios digitales.',
    }
};

export default function SobreNosotrosPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 min-h-screen" style={{ paddingTop: '120px', paddingBottom: '64px' }}>
            <div className="bg-[#1e1e24] p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6 text-center">
                    Sobre Nosotros
                </h1>

                <div className="space-y-8 text-gray-300 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-500">🚀</span> ¿Quiénes Somos?
                        </h2>
                        <p>
                            En <strong>GeekTech</strong> somos un equipo de apasionados por la tecnología con el objetivo de brindar acceso a software, juegos y servicios de streaming premium a precios accesibles. Creados con la visión de apoyar la digitalización en Bolivia y Latinoamérica, garantizamos que cada producto adquirido cumpla con los estándares más altos de confiabilidad y legalidad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-blue-500">🎯</span> Nuestra Misión
                        </h2>
                        <p>
                            Nuestra misión es empoderar a estudiantes, profesionales y empresas ofreciendo licencias oficiales y servicios de entretenimiento rápido, seguro y con un soporte 100% personalizado. Buscamos eliminar las barreras tecnológicas entregando herramientas esenciales de forma inmediata.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-500">🛡️</span> ¿Por qué elegirnos?
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong className="text-white">Licencias 100% Originales:</strong> Productos garantizados, sin activadores maliciosos ni riesgos para tu equipo.</li>
                            <li><strong className="text-white">Entrega Inmediata:</strong> Activaciones digitales enviadas casi al instante para que no tengas que esperar.</li>
                            <li><strong className="text-white">Soporte Dedicado:</strong> Asistencia personalizada vía WhatsApp y Discord para resolver cualquier problema o duda de instalación.</li>
                            <li><strong className="text-white">Precios Competitivos:</strong> Ofertas adaptadas al mercado para ofrecerte el mejor valor por tu dinero.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
