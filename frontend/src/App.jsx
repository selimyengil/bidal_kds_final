import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, Package, Users, Truck, LogOut, User, Lock, AlertCircle } from 'lucide-react';

// --- Yeni Servisler ---
import { loginUser, fetchSezonTrendi, fetchBolgePerformans, fetchUrunAnaliz, fetchCariAnaliz } from './services/api';

// --- Yeni Sayfalar (Views) ---
import Dashboard from './views/Dashboard';
import CiroAnaliz from './views/ciroanaliz';
// ... Diğer importlar
import UrunAnaliz from './views/UrunAnaliz';
import CariAnaliz from './views/CariAnaliz';
import BolgeAnaliz from './views/BolgeAnaliz';

// ... App fonksiyonunun içindeki return kısmında da şu satırların aktif olduğundan emin ol:

{/* Ana İçerik */}
<main className="flex-1 ml-64 p-8">
  <header className="flex justify-between items-center mb-8">
     {/* Header içeriği... */}
  </header>

  {activeTab === 'dashboard' && <Dashboard sezonData={sezonData} urunData={urunData} cariData={cariData} bolgeData={bolgeData} />}
  {activeTab === 'ciro' && <CiroAnaliz sezonData={sezonData} />}
  {activeTab === 'urun' && <UrunAnaliz data={urunData} />}
  {activeTab === 'cari' && <CariAnaliz data={cariData} />}
  {activeTab === 'bolge' && <BolgeAnaliz data={bolgeData} />}
</main>
// Diğerlerini de oluşturup import etmelisin:
// import UrunAnaliz from './views/UrunAnaliz';
// import CariAnaliz from './views/CariAnaliz';
// import BolgeAnaliz from './views/BolgeAnaliz';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Veri State'leri (Model)
  const [sezonData, setSezonData] = useState([]);
  const [bolgeData, setBolgeData] = useState([]);
  const [urunData, setUrunData] = useState([]);
  const [cariData, setCariData] = useState({ vip: [], tum_cariler: [] });

  // Auth State'leri
  const [token, setToken] = useState(localStorage.getItem('bidal_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('bidal_user')) || {});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Login İşlemi ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ username, password });
      if (res.data.success) {
        localStorage.setItem('bidal_token', res.data.token);
        localStorage.setItem('bidal_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } catch (err) {
      setError('Hatalı giriş!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bidal_token');
    setToken(null);
  };

  // --- Veri Çekme (Controller Görevi) ---
  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [sezonRes, bolgeRes, urunRes, cariRes] = await Promise.all([
           fetchSezonTrendi(),
           fetchBolgePerformans(),
           fetchUrunAnaliz(),
           fetchCariAnaliz()
        ]);
        
        setSezonData(sezonRes.data);
        setBolgeData(bolgeRes.data);
        setUrunData(urunRes.data);
        setCariData(cariRes.data);
      } catch (err) {
        console.error("Veri hatası:", err);
      }
    };
    loadData();
  }, [token]);

  // --- Render Mantığı ---
  if (!token) {
      // Login Formu Buraya (Bunu da ayrı bir Login.jsx yapabilirsin aslında!)
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            {/* Login JSX Kodları... */}
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl">
                 <h1 className="text-2xl font-bold mb-4">Giriş Yap</h1>
                 <input className="border p-2 w-full mb-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Kullanıcı Adı"/>
                 <input className="border p-2 w-full mb-4" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Şifre"/>
                 <button className="bg-blue-900 text-white w-full p-2 rounded">Giriş</button>
                 {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-2xl font-bold text-blue-400">BİDAL KDS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab==='dashboard' ? 'bg-blue-600':''}`}>
                <LayoutDashboard size={20}/> Genel Bakış
            </button>
            <button onClick={() => setActiveTab('ciro')} className={`w-full flex items-center gap-3 p-3 rounded ${activeTab==='ciro' ? 'bg-blue-600':''}`}>
                <TrendingUp size={20}/> Ciro & Tahmin
            </button>
            {/* Diğer butonlar... */}
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
            <button onClick={handleLogout} className="flex gap-2 text-red-400"><LogOut/> Çıkış</button>
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 ml-64 p-8">
        {activeTab === 'dashboard' && <Dashboard sezonData={sezonData} urunData={urunData} cariData={cariData} bolgeData={bolgeData} />}
        {activeTab === 'ciro' && <CiroAnaliz sezonData={sezonData} />}
        {/* {activeTab === 'urun' && <UrunAnaliz data={urunData} />}
            {activeTab === 'cari' && <CariAnaliz data={cariData} />}
            {activeTab === 'bolge' && <BolgeAnaliz data={bolgeData} />}
        */}
      </main>
    </div>
  );
}

export default App;