import React from 'react';
import sql from '@/lib/db';
import { DollarSign, Search, Filter, Activity, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrdersDashboard() {
    try {
        const orders = await sql`
            SELECT o.id, o.total_usd, o.total_bs, o.status, o.created_at, u.name as user_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        
        const stats = await sql`
            SELECT 
                SUM(total_usd) as revenue_usd, 
                SUM(total_bs) as revenue_bs,
                COUNT(id) as total_sales
            FROM orders 
            WHERE status = 'completado'
        `;

        return { orders, stats: stats[0] || { revenue_usd: 0, revenue_bs: 0, total_sales: 0 } };
    } catch (e) {
        return { orders: [], stats: { revenue_usd: 0, revenue_bs: 0, total_sales: 0 } };
    }
}

export default async function AdminHistory() {
    const { orders, stats } = await getOrdersDashboard();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-center border-b border-purple-900/50 pb-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            SHADOW ADMIN
                        </h1>
                        <p className="text-purple-400/60 mt-1 text-sm font-mono tracking-widest uppercase">Historial de Ventas</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="absolute -right-4 -top-4 bg-purple-600/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ingresos USD</h3>
                            <DollarSign className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-mono font-bold text-gray-100">${parseFloat(stats.revenue_usd || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="absolute -right-4 -top-4 bg-purple-600/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ingresos BS</h3>
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-mono font-bold text-gray-100">{parseFloat(stats.revenue_bs || 0).toFixed(2)} Bs</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="absolute -right-4 -top-4 bg-purple-600/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ventas Totales</h3>
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-mono font-bold text-gray-100">{stats.total_sales || 0}</p>
                    </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl shadow-xl relative z-10 overflow-hidden">
                    <div className="p-6 border-b border-purple-900/30 flex flex-wrap gap-4 justify-between items-center bg-gray-950/30">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder="Buscar usuario..." 
                                className="pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all w-64 shadow-inner"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 font-medium transition-colors">
                            <Filter className="w-4 h-4" />
                            Filtrar por Estado
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-purple-900/40 text-xs uppercase font-mono text-purple-400/80 bg-gray-900/20">
                                    <th className="py-4 pl-6">ID Orden</th>
                                    <th className="py-4">Usuario</th>
                                    <th className="py-4">Monto (USD/BS)</th>
                                    <th className="py-4">Estado</th>
                                    <th className="py-4">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o: any) => (
                                    <tr key={o.id} className="border-b border-gray-800/30 hover:bg-purple-900/10 transition-colors group">
                                        <td className="py-4 pl-6 font-mono text-gray-500 text-sm">#{o.id}</td>
                                        <td className="py-4 font-medium text-gray-300 group-hover:text-purple-300 transition-colors">{o.user_name}</td>
                                        <td className="py-4">
                                            <div className="font-mono text-purple-400">${parseFloat(o.total_usd).toFixed(2)}</div>
                                            <div className="font-mono text-xs text-gray-500">{parseFloat(o.total_bs).toFixed(2)} Bs</div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                ${o.status === 'completado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                  o.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                                            `}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="py-4 font-mono text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-600 font-mono text-sm">
                                            No hay ventas registradas en el sistema.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
