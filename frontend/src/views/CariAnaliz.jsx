import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, Crown, TrendingUp, TrendingDown, AlertCircle, Search, ArrowRight } from 'lucide-react';

const CariAnaliz = ({ data }) => {
    const [cariSearch, setCariSearch] = useState("");

    if (!data || !data.vip) {
        return <div className="p-10 text-center text-slate-500">Müşteri verileri yükleniyor...</div>;
    }

    const { vip, tum_cariler } = data;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Filtreleme
    const filteredCustomers = (tum_cariler || []).filter(item => 
        item.cari_ad.toLowerCase().includes(cariSearch.toLowerCase())
    );

    // KPI
    const enBuyukKayip = (tum_cariler || []).reduce((min, curr) => (Number(curr.fark) < Number(min.fark) ? curr : min), tum_cariler[0] || { fark: 0 });
    const sampiyon = vip[0] || {};

    // Grafik
    const pieData = vip.map(v => ({ name: v.cari_ad, value: Number(v.guncel_ciro) }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Üst Kartlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Crown className="text-green-500" />
                                <h3 className="font-bold text-slate-700">Ciro Şampiyonu</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{sampiyon.cari_ad || '-'}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                2025 Ciro: <span className="text-green-600 font-bold">₺{Number(sampiyon.guncel_ciro || 0).toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600"><TrendingUp size={24}/></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="text-red-500" />
                                <h3 className="font-bold text-slate-700">En Kritik Düşüş</h3>
                            </div>
                            <p className="text-lg font-semibold text-slate-800">{enBuyukKayip.cari_ad || '-'}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Kayıp: <span className="text-red-600 font-bold">₺{Math.abs(Number(enBuyukKayip.fark || 0)).toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full text-red-600"><TrendingDown size={24}/></div>
                    </div>
                </div>
            </div>

            {/* Grafik ve Tablo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm h-[600px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-2">VIP Müşteri Payı</h3>
                    <div className="flex-1">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(val) => `₺${Number(val).toLocaleString()}`} />
                                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2 h-[600px] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users className="text-blue-600" size={20}/> Müşteri Projeksiyonu</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                            <input type="text" placeholder="Müşteri ara..." className="pl-10 pr-4 py-2 border rounded-lg text-sm" value={cariSearch} onChange={e => setCariSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10 border-b">
                                <tr className="text-xs text-slate-500 font-bold">
                                    <th className="p-3">Müşteri</th>
                                    <th className="p-3 text-right">2024</th>
                                    <th className="p-3 text-right">2025</th>
                                    <th className="p-3 text-right text-blue-600">2026 (Tahmin)</th>
                                    <th className="p-3 text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredCustomers.map((item, idx) => {
                                    const c23 = Number(item.ciro_2023 || 0);
                                    const c24 = Number(item.ciro_2024 || 0);
                                    const c25 = Number(item.ciro_2025 || 0);
                                    
                                    let t1 = c23 > 0 ? (c24 - c23) / c23 : 0;
                                    let t2 = c24 > 0 ? (c25 - c24) / c24 : 0.5;
                                    let genelTrend = (c23 === 0) ? t2 : (t1 * 0.4) + (t2 * 0.6);
                                    
                                    const c26 = Math.max(0, Math.round(c25 * (1 + genelTrend)));
                                    const gosterilenTrend = Math.round(genelTrend * 100);

                                    return (
                                        <tr key={idx} className="border-b hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-700">{item.cari_ad}</td>
                                            <td className="p-3 text-right text-slate-400">₺{c24.toLocaleString()}</td>
                                            <td className="p-3 text-right text-slate-800">₺{c25.toLocaleString()}</td>
                                            <td className="p-3 text-right font-bold text-blue-600 bg-blue-50/30">₺{c26.toLocaleString()}</td>
                                            <td className="p-3 text-right">
                                                <span className={`text-xs font-bold ${gosterilenTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    %{gosterilenTrend}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CariAnaliz;