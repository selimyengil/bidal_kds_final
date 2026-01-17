require('dotenv').config(); // BU SATIR EN ÜSTTE OLMALI
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Rotalar ---
// Tüm API isteklerini routes klasörüne yönlendiriyoruz
app.use('/api', apiRoutes);

// --- Sunucuyu Başlat ---
// Önce veritabanına bağlanmayı dene, başarılıysa sunucuyu aç
sequelize.authenticate()
    .then(() => {
        console.log('✅ Veritabanı bağlantısı başarılı.');
        app.listen(PORT, () => {
            console.log(`🚀 Backend (Beyin) çalışıyor: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Veritabanına bağlanılamadı:', err);
    });