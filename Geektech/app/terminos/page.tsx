import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Términos, condiciones de uso y políticas de la tienda en línea y servicios digitales de GeekTech.',
    keywords: ['terminos geektech', 'condiciones de uso', 'politicas reembolso', 'reglas streaming', 'terminos legales'],
    openGraph: {
        title: 'Términos y Condiciones | GeekTech Store',
        description: 'Términos y condiciones de uso y políticas de GeekTech.',
        url: 'https://geektech.onl/terminos',
        type: 'website',
    },
    twitter: {
        title: 'Términos y Condiciones | GeekTech Store',
        description: 'Términos y condiciones de uso y políticas de GeekTech.',
    }
};

export default function TerminosPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 min-h-screen" style={{ paddingTop: '120px', paddingBottom: '64px' }}>
            <div className="bg-[#1e1e24] p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center">
                    Términos y Condiciones
                </h1>

                <div className="space-y-8 text-gray-300 leading-relaxed text-md">
                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar el sitio web de <strong>GeekTech</strong>, así como al adquirir nuestros servicios o productos digitales, aceptas estar sujeto a los presentes términos y condiciones. Si no estás de acuerdo con alguna parte de los términos, te rogamos no utilizar nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">2. Productos y Entrega Digital</h2>
                        <p>
                            GeekTech comercializa bienes intangibles que incluyen, pero no se limitan a: licencias de software, suscripciones de cuentas de streaming y juegos digitales.
                            <br /><br />
                            Debido a la naturaleza de estos productos, la entrega se realiza de forma digital (por correo electrónico o los canales oficiales de contacto de WhatsApp/Discord) de manera inmediata una vez confirmado el pago. No existen envíos físicos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">3. Política de Reembolsos y Garantías</h2>
                        <p>
                            Dado el carácter de los productos digitales comercializados (licencias y cuentas que una vez visualizadas o activadas no se pueden &quot;devolver&quot;), <strong>todas las ventas son finales y no son elegibles para reembolsos generales.</strong>
                            <br /><br />
                            Sin embargo, ofrecemos una <strong>Garantía de Funcionamiento</strong>: si la clave, cuenta o licencia suministrada resulta inválida o defectuosa desde el primer momento de entrega, GeekTech se compromete a proporcionar un reemplazo tras la verificación del evento con nuestro soporte técnico.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">4. Cuentas de Streaming</h2>
                        <p>
                            Respecto a la venta de pantallas y perfiles de plataformas de streaming, el usuario tiene la obligación de no alterar los datos de la cuenta maestra (contraseñas, correos, nombres de perfiles ajenos). Cualquier modificación no autorizada o mal uso de la cuenta resultará en la suspensión inmediata del servicio sin derecho a reembolso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">5. Uso Aceptable</h2>
                        <p>
                            El usuario se compromete a no utilizar nuestros productos para ningún fin ilícito. La re-venta de los códigos provistos por GeekTech sin autorización expresa, o el intento de cometer fraude o ingeniería social a nuestro personal será motivo de baneo permanente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-400 mb-3">6. Modificaciones de los Términos</h2>
                        <p>
                            GeekTech se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor de manera inmediata tras su publicación en esta página web.
                        </p>
                        <p className="mt-4 text-sm text-gray-400">
                            Última actualización: 22 de Febrero de 2026.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
