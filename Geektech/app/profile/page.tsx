import React from 'react';
import { getServerSession } from "next-auth/next";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import sql from '@/lib/db';
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function UserProfile() {
    const session = await getServerSession();
    
    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const userEmail = session.user.email;
    let orders = [];
    
    try {
        const users = await sql`SELECT id FROM users WHERE email = ${userEmail}`;
        const userId = users.length > 0 ? users[0].id : null;

        if (userId) {
            orders = await sql`
                SELECT o.id, o.total_usd, o.total_bs, o.status, o.created_at,
                json_agg(json_build_object('name', p.name, 'qty', oi.quantity, 'price', oi.price_usd)) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN productos p ON oi.producto_id = p.id
                WHERE o.user_id = ${userId}
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `;
        }
    } catch (e) {
        console.error(e);
    }

    const getStatusIcon = (status: string) => {
        if (status === 'completado') return <CheckCircle className="w-5 h-5 text-green-400" />;
        if (status === 'cancelado') return <XCircle className="w-5 h-5 text-red-400" />;
        return <Clock className="w-5 h-5 text-yellow-400" />;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 border-b border-purple-900/50 pb-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-purple-900 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className="text-2xl font-bold">{session.user.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                            HOLA, {session.user.name?.toUpperCase() || 'JUGADOR'}
                        </h1>
                        <p className="text-purple-400/60 mt-1 text-sm font-mono tracking-widest uppercase">Perfil de Usuario</p>
                    </div>
                </header>

                <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-xl relative z-10">
                    <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-purple-500" /> Mis Compras
                    </h2>

                    <div className="space-y-4">
                        {orders.map((o: any) => (
                            <div key={o.id} className="border border-gray-800/50 bg-gray-950/50 rounded-xl p-5 hover:border-purple-500/30 transition-all group shadow-inner">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-800/50">
                                    <div>
                                        <p className="text-xs font-mono text-purple-400/70 mb-1">ORDEN #{o.id} • {new Date(o.created_at).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(o.status)}
                                            <span className={`text-sm font-bold uppercase tracking-wider ${o.status === 'completado' ? 'text-green-400' : o.status === 'cancelado' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xl text-purple-400">${parseFloat(o.total_usd).toFixed(2)}</p>
                                        <p className="font-mono text-sm text-gray-500">{parseFloat(o.total_bs).toFixed(2)} Bs</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artículos adquiridos</p>
                                    {o.items.map((item: any, idx: number) => (
                                        item.name && (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300"><span className="text-purple-400/70 font-mono font-bold mr-1">{item.qty}x</span> {item.name}</span>
                                                <span className="font-mono text-gray-500">${parseFloat(item.price).toFixed(2)}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {orders.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-mono text-sm">Aún no tienes compras registradas en el sistema.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
