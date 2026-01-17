import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Search, Crown, Package, XCircle, Target } from 'lucide-react';

const UrunAnaliz = ({ data }) => {
    // Arama state'ini artık bu sayfanın içinde yönetiyoruz
    const [searchTerm, setSearchTerm] = useState("");

    if (!data || data.length === 0) {
        return <div className="p-10 text-center text-slate-500">Veriler yükleniyor...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#0b9e59ff', '#FF8042', '#8884d8', '#82ca9d', '#e40a52ff', '#ff6b6b', '#8e44ad'];

    // --- VERİ İŞLEME VE TAHMİN MOTORU ---
    const enrichedData = data.map((item, index) => {
        const satis2023 = Number(item.satis_2023 || item.Satis2023 || 0);
        const satis2024 = Number(item.satis_2024 || item.gecmisSatis || 0);
        const satis2025 = Number(item.satis_2025 || item.guncelSatis || 0);

        // Trend Hesaplama
        let trend1 = satis2023 > 0 ? (satis2024 - satis2023) / satis2023 : (satis2024 > 0 ? 1 : 0);
        let trend2 = satis2024 > 0 ? (satis2025 - satis2024) / satis2024 : (satis2025 > 0 ? 1 : 0);

        // Ağırlıklı Ortalama (Son yıl daha etkili)
        let genelTrend = (satis2023 === 0 && satis2024 === 0) ? trend2 : (trend1 * 0.4) + (trend2 * 0.6);

        const gelecekTahmin = Math.max(0, Math.round(satis2025 * (1 + genelTrend)));

        return {
            ...item,
            uniqueId: item.urun_id || index, // Unique key sorunu için
            kategori: item.grup_ad || 'Diğer',
            gecmisSatis: satis2024,
            guncelSatis: satis2025,
            satis2023: satis2023,
            gelecekTahmin: gelecekTahmin,
            buyumeYuzde: Math.round(genelTrend * 100)
        };
    });

    // KPI Hesaplamaları
    const yildizUrun = enrichedData.reduce((prev, curr) => (prev.gelecekTahmin > curr.gelecekTahmin) ? prev : curr, enrichedData[0] || {});
    
    const dususTrendi = [...enrichedData]
        .sort((a, b) => a.buyumeYuzde - b.buyumeYuzde)
        .slice(0, 2);

    // Grafik Verileri Hazırlığı
    const pieDataMap = {};
    enrichedData.forEach(item => {
        const cat = item.kategori || 'Diğer';
        const ciro = Number(item.toplam_ciro || item.guncelSatis || 0);
        pieDataMap[cat] = (pieDataMap[cat] || 0) + ciro;
    });
    const pieData = Object.keys(pieDataMap).map(key => ({ name: key, value: pieDataMap[key] }));

    const lineChartData = [
        { name: '2023', ...enrichedData.reduce((acc, item) => ({...acc, [item.kategori]: (acc[item.kategori] || 0) + item.satis2023}), {}) },
        { name: '2024', ...enrichedData.reduce((acc, item) => ({...acc, [item.kategori]: (acc[item.kategori] || 0) + item.gecmisSatis}), {}) },
        { name: '2025', ...enrichedData.reduce((acc, item) => ({...acc, [item.kategori]: (acc[item.kategori] || 0) + item.guncelSatis}), {}) },
    ];

    const uniqueCategories = [...new Set(enrichedData.map(i => i.kategori))];

    const barChartData = Object.values(enrichedData.reduce((acc, curr) => {
        const grup = curr.kategori;
        if (!acc[grup]) acc[grup] = { name: grup, '2025 Satış': 0, '2026 Tahmin': 0 };
        acc[grup]['2025 Satış'] += curr.guncelSatis;
        acc[grup]['2026 Tahmin'] += curr.gelecekTahmin;
        return acc;
    }, {}));

    // Filtreleme
    const filteredTableData = enrichedData.filter((item) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (item.urun_ad || "").toLowerCase().includes(searchLower) || (item.kategori || "").toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Üst Kartlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yıldız Ürün Kartı */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Crown className="text-yellow-500" />
                                <h3 className="font-bold text-slate-700">Gelecek Sezonun Yıldızı</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{yildizUrun.urun_ad || '-'}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                2026 Tahmini Talep: <span className="text-green-600 font-bold">{yildizUrun.gelecekTahmin} Adet</span>
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600"><TrendingUp size={24} /></div>
                    </div>
                </div>

                {/* Düşüş Alarmı Kartı */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-500" />
                        <h3 className="font-bold text-slate-700">Düşüş Alarmı</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        {dususTrendi.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-1">
                                <span className="text-slate-800 font-semibold truncate w-2/3">{item.urun_ad}</span>
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                    %{item.buyumeYuzde}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tablo ve Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pasta Grafik */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-[500px] flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-2">Grup Dağılımı</h3>
                    <div className="flex-1">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label={({percent}) => `${(percent * 100).toFixed(0)}%`}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tablo */}
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2 h-[500px] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Package size={20} className="text-blue-600"/> Ürün Tahmin Listesi</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                            <input type="text" placeholder="Ara..." className="pl-10 pr-4 py-2 border rounded-lg text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10 border-b">
                                <tr className="text-xs text-slate-500 font-bold">
                                    <th className="p-3">Ürün</th>
                                    <th className="p-3 text-right">2025</th>
                                    <th className="p-3 text-right text-blue-600">2026 (Tahmin)</th>
                                    <th className="p-3 text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredTableData.map(item => (
                                    <tr key={item.uniqueId} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.urun_ad}</td>
                                        <td className="p-3 text-right">{item.guncelSatis}</td>
                                        <td className="p-3 text-right font-bold text-blue-600">{item.gelecekTahmin}</td>
                                        <td className="p-3 text-right">
                                            <span className={`text-xs font-bold ${item.buyumeYuzde >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                %{item.buyumeYuzde}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Alt Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm h-[400px]">
                     <h3 className="font-bold text-slate-700 mb-4">Kategori Trendi</h3>
                     <ResponsiveContainer>
                        <LineChart data={lineChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {uniqueCategories.map((cat, idx) => (
                                <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[idx % COLORS.length]} />
                            ))}
                        </LineChart>
                     </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm h-[400px]">
                    <h3 className="font-bold text-slate-700 mb-4">Hedef Kıyaslaması</h3>
                    <ResponsiveContainer>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="name" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="2025 Satış" fill="#cbd5e1" radius={[4,4,0,0]} />
                            <Bar dataKey="2026 Tahmin" fill="#3b82f6" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UrunAnaliz;