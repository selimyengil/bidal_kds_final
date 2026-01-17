import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Users, MapPin, Activity } from 'lucide-react';

const Dashboard = ({ sezonData, urunData, cariData, bolgeData }) => {
    
    // Veri yoksa yükleniyor göster
    if (!sezonData.length || !urunData.length) return <div className="p-10 text-center">Veriler Yükleniyor...</div>;

    // Hesaplamalar buraya (App.jsx'ten kopyaladık)
    const toplamCiro2025 = sezonData.reduce((acc, cur) => acc + Number(cur.ciro_2025 || 0), 0);
    const kritikStokUrun = urunData[1] || { urun_ad: '-', stok: 0 };
    const sampiyonMusteri = cariData?.vip?.[0] || { cari_ad: '-', guncel_ciro: 0 };
    const sampiyonBolge = (bolgeData || []).reduce((max, region) => {
        return Number(region.satis_2025) > Number(max.satis_2025) ? region : max;
    }, { bolge_ad: '-', satis_2025: 0 });

    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const trendData = sezonData.map(item => ({
        name: aylar[item.ay - 1] || item.ay,
        '2024': Number(item.ciro_2024 || 0),
        '2025': Number(item.ciro_2025 || 0),     
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Buraya renderDashboard() içindeki JSX kodlarını yapıştır */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Hoşgeldin,</h2>
                    <p className="text-blue-200">İşte şirketin bu dönemki anlık durumu.</p>
                </div>
                <Activity className="absolute right-0 bottom-0 text-white opacity-5 w-64 h-64 -mr-10 -mb-10"/>
            </div>

            {/* Kartlar ve Grafikler buraya gelecek... */}
            {/* Özet Kartları */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Örnek bir kart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500">
                    <h3 className="text-2xl font-bold">₺{toplamCiro2025.toLocaleString()}</h3>
                    <p className="text-slate-500 text-sm">2025 Toplam Ciro</p>
                </div>
                {/* Diğer kartlar... */}
             </div>
        </div>
    );
};

export default Dashboard;