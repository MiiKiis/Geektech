import React from 'react';
import sql from '@/lib/db';

// Forzar renderizado dinámico para que los datos siempre estén actualizados
export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        return await sql`SELECT * FROM productos ORDER BY created_at DESC`;
    } catch (e) {
        return [];
    }
}

async function getSettings() {
    try {
        const res = await sql`SELECT value FROM settings WHERE key = 'usd_to_bs'`;
        return res.length > 0 ? res[0].value : 0;
    } catch (e) {
        return 0;
    }
}

export default async function AdminPanel() {
    const products = await getProducts();
    const exchangeRate = await getSettings();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-center border-b border-purple-900/50 pb-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            SHADOW ADMIN
                        </h1>
                        <p className="text-purple-400/60 mt-1 text-sm font-mono tracking-widest uppercase">System Dashboard</p>
                    </div>
                    <div className="bg-gray-900 border border-purple-800/40 px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                        <span className="font-mono text-sm text-gray-300">TASA USD: <span className="text-purple-400 font-bold ml-1">{exchangeRate} Bs</span></span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-xl relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-200">Inventario Geektech</h2>
                            <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] text-sm">
                                + Nuevo Ítem
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-purple-900/40 text-sm uppercase font-mono text-purple-400/80">
                                        <th className="pb-3 pl-2">ID</th>
                                        <th className="pb-3">Nombre</th>
                                        <th className="pb-3">Precio (USD)</th>
                                        <th className="pb-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p: any) => (
                                        <tr key={p.id} className="border-b border-gray-800/50 hover:bg-purple-900/20 transition-colors group">
                                            <td className="py-4 pl-2 font-mono text-gray-500 text-sm">#{p.id}</td>
                                            <td className="py-4 font-medium text-gray-300 group-hover:text-purple-300 transition-colors">{p.name}</td>
                                            <td className="py-4 font-mono text-purple-400">${parseFloat(p.price_usd).toFixed(2)}</td>
                                            <td className="py-4">
                                                <button className="text-gray-500 hover:text-purple-400 text-sm underline decoration-purple-500/0 hover:decoration-purple-500 transition-all">Editar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-600 font-mono text-sm">Sin datos en la base de datos.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                            
                            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                                <span className="text-purple-500">⚡</span> Ajuste de Moneda
                            </h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-purple-400/70 mb-2">TASA USD/BS ACTUAL</label>
                                    <input 
                                        type="number" 
                                        defaultValue={exchangeRate} 
                                        className="w-full bg-gray-950 border border-purple-900/50 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                                        step="0.01"
                                    />
                                </div>
                                <button className="w-full bg-gray-800 hover:bg-gray-700 border border-purple-700/50 text-purple-300 py-3 rounded-xl font-bold transition-all hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    Actualizar Tasa
                                </button>
                            </form>
                        </div>
                        
                        <div className="bg-gray-900/50 backdrop-blur-md border border-purple-900/30 rounded-2xl p-6 shadow-xl border-dashed">
                            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Subir Media</h3>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-900/50 border-dashed rounded-xl cursor-pointer bg-gray-950/50 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-3 text-purple-500/70 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="mb-2 text-sm text-gray-400 group-hover:text-gray-300"><span className="font-semibold text-purple-400">Click para subir</span></p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
