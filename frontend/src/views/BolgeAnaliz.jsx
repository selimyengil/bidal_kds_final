import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MapPin, Crown, AlertCircle, Activity, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet ikon hatası düzeltmesi
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BolgeAnaliz = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="p-10 text-center text-slate-500">Bölge verileri yükleniyor...</div>;
    }

    const koordinatlar = {
      'Assos': [39.4905, 26.3364], 'Behram': [39.48, 26.34], 'Geyikli': [39.8056, 26.2256],
      'Altınoluk': [39.5706, 26.7431], 'Çanakkale': [40.1553, 26.4142], 'Küçükkuyu': [39.5519, 26.6067],
      'Ayvacık': [39.6014, 26.4039], 'Ezine': [39.79, 26.33], 'Edremit': [39.5961, 27.0244],
      'Akçay': [39.5853, 26.9239], 'Yeşilyurt': [39.5630, 26.5500], 'Adatepe': [39.5670, 26.6100],
      'Bozcaada': [39.8350, 26.0300]
    };
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    const enrichedRegions = data.map(item => {
        const s23 = Number(item.satis_2023 || 0);
        const s24 = Number(item.satis_2024 || 0);
        const s25 = Number(item.satis_2025 || 0);
        
        let trend1 = s23 > 0 ? (s24 - s23) / s23 : 0;
        let trend2 = s24 > 0 ? (s25 - s24) / s24 : 0;
        let genelTrend = (trend1 * 0.4) + (trend2 * 0.6);
        
        return {
            ...item,
            coords: koordinatlar[item.bolge_ad] || [39.6, 26.6],
            tahmin2026: Math.round(s25 * (1 + genelTrend)),
            buyumeYuzde: Math.round(genelTrend * 100),
            satis2025: s25
        };
    });

    const championRegion = enrichedRegions.reduce((prev, curr) => (prev.tahmin2026 > curr.tahmin2026) ? prev : curr, enrichedRegions[0]);
    const riskRegion = enrichedRegions.reduce((prev, curr) => (prev.buyumeYuzde < curr.buyumeYuzde) ? prev : curr, enrichedRegions[0]);
    const pieData = enrichedRegions.map(r => ({ name: r.bolge_ad, value: r.satis2025 }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Kartlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="text-blue-500" size={20}/>
                                <h3 className="font-bold text-slate-700">Şampiyon Bölge (2026)</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{championRegion.bolge_ad}</p>
                            <p className="text-sm text-slate-500 mt-1">Hedef: ₺{championRegion.tahmin2026.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Crown size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="text-orange-500" size={20}/>
                                <h3 className="font-bold text-slate-700">Gelişim Alanı</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{riskRegion.bolge_ad}</p>
                            <p className="text-sm text-slate-500 mt-1">Büyüme: %{riskRegion.buyumeYuzde}</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Activity size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Harita ve Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm flex flex-col h-full">
                    <h3 className="font-bold text-slate-700 mb-2">Bölgesel Dağılım</h3>
                    <div className="flex-1">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label={({percent})=>`${(percent*100).toFixed(0)}%`}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(val) => `₺${val.toLocaleString()}`}/>
                                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-50 p-1 rounded-xl shadow-md border border-slate-200 relative">
                    <MapContainer center={[39.8, 26.6]} zoom={9} style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        {enrichedRegions.map((loc, idx) => (
                            <CircleMarker 
                                key={idx} 
                                center={loc.coords} 
                                pathOptions={{ fillColor: '#3b82f6', color: 'white', weight: 2, fillOpacity: 0.8 }} 
                                radius={Math.max(10, Math.min(loc.satis2025 / 50000, 40))}
                            >
                                <Popup>
                                    <strong>{loc.bolge_ad}</strong><br/>
                                    Ciro: ₺{loc.satis2025.toLocaleString()}<br/>
                                    Hedef: ₺{loc.tahmin2026.toLocaleString()}
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default BolgeAnaliz;