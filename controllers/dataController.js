const sequelize = require('../config/db');

// Sezonluk Trend Analizi
exports.getSezonTrendi = async (req, res) => {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                MONTH(tarih) as ay,
                SUM(CASE WHEN YEAR(tarih) = 2023 THEN toplam_tutar ELSE 0 END) as ciro_2023,
                SUM(CASE WHEN YEAR(tarih) = 2024 THEN toplam_tutar ELSE 0 END) as ciro_2024,
                SUM(CASE WHEN YEAR(tarih) = 2025 THEN toplam_tutar ELSE 0 END) as ciro_2025
            FROM satislar
            GROUP BY MONTH(tarih)
            ORDER BY ay
        `);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Ürün Analizi
exports.getUrunAnaliz = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.urun_ad,
                g.grup_ad,
                u.guncel_fiyat,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2023 THEN us.adet ELSE 0 END), 0) as satis_2023,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2024 THEN us.adet ELSE 0 END), 0) as satis_2024,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2025 THEN us.adet ELSE 0 END), 0) as satis_2025,
                SUM(us.adet * us.birim_fiyat) as toplam_ciro
            FROM urunler u
            LEFT JOIN grup g ON u.grup_id = g.grup_id
            LEFT JOIN urun_satis us ON u.urun_id = us.urun_id
            LEFT JOIN satislar s ON us.satis_id = s.satis_id
            GROUP BY u.urun_id, u.urun_ad, g.grup_ad, u.guncel_fiyat
            ORDER BY toplam_ciro DESC
        `;
        const [results] = await sequelize.query(query);
        res.json(results);
    } catch (err) {
        console.error("Ürün Analiz Hatası:", err);
        res.status(500).json({ error: 'Veritabanı sorgusu başarısız oldu.' });
    }
};

// Cari Analiz
exports.getCariAnaliz = async (req, res) => {
    try {
        // VIP Müşteriler
        const [vipResults] = await sequelize.query(`
            SELECT c.cari_ad, SUM(CASE WHEN YEAR(s.tarih) = 2025 THEN s.toplam_tutar ELSE 0 END) as guncel_ciro
            FROM satislar s
            JOIN cariler c ON s.cari_id = c.cari_id
            GROUP BY c.cari_id, c.cari_ad
            ORDER BY guncel_ciro DESC LIMIT 5
        `);

        // Genel Performans
        const [performansResults] = await sequelize.query(`
            SELECT 
                c.cari_ad,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2023 THEN s.toplam_tutar ELSE 0 END), 0) as ciro_2023,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2024 THEN s.toplam_tutar ELSE 0 END), 0) as ciro_2024,
                COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2025 THEN s.toplam_tutar ELSE 0 END), 0) as ciro_2025,
                (COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2025 THEN s.toplam_tutar ELSE 0 END), 0) - 
                 COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2024 THEN s.toplam_tutar ELSE 0 END), 0)) as fark
            FROM cariler c
            LEFT JOIN satislar s ON c.cari_id = s.cari_id
            GROUP BY c.cari_id, c.cari_ad
            ORDER BY ciro_2025 DESC LIMIT 200
        `);

        res.json({ vip: vipResults, tum_cariler: performansResults });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bölge Performans
exports.getBolgePerformans = async (req, res) => {
    const sql = `
        SELECT 
            b.bolge_id, b.bolge_ad,
            COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2023 THEN s.toplam_tutar ELSE 0 END), 0) AS satis_2023,
            COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2024 THEN s.toplam_tutar ELSE 0 END), 0) AS satis_2024,
            COALESCE(SUM(CASE WHEN YEAR(s.tarih) = 2025 THEN s.toplam_tutar ELSE 0 END), 0) AS satis_2025,
            COUNT(s.satis_id) as toplam_yuk
        FROM bolgeler b
        LEFT JOIN cariler c ON b.bolge_id = c.bolge_id
        LEFT JOIN satislar s ON c.cari_id = s.cari_id
        GROUP BY b.bolge_id, b.bolge_ad
    `;
    try {
        const [results] = await sequelize.query(sql);
        res.send(results);
    } catch (err) {
        console.log("Veritabanı Hatası:", err);
        res.status(500).send("Veritabanı hatası");
    }
};


exports.updateUrunFiyat = async (req, res) => {
    const { urun_id, yeni_fiyat } = req.body;

    try {
        // KURAL KONTROLÜ
        if (yeni_fiyat <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "HATA: İş kuralı gereği ürün fiyatı 0 veya negatif olamaz!" 
            });
        }

        // Güncelleme İşlemi (CRUD - Update)
        await sequelize.query(`
            UPDATE urunler SET guncel_fiyat = ${yeni_fiyat} WHERE urun_id = ${urun_id}
        `);

        res.json({ success: true, message: "Fiyat başarıyla güncellendi." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SENARYO 2: Ürün Silme (Delete)
// İş Kuralı: Eğer bir ürün geçmişte satılmışsa (satislar tablosunda varsa) silinemez.
exports.deleteUrun = async (req, res) => {
    const { urun_id } = req.body; // veya params

    try {
        // Önce ürünün satışı var mı kontrol et (Read)
        const [satisKayitlari] = await sequelize.query(`
            SELECT COUNT(*) as adet FROM urun_satis WHERE urun_id = ${urun_id}
        `);

        // KURAL KONTROLÜ
        if (satisKayitlari[0].adet > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `HATA: Bu ürünle ilişkili ${satisKayitlari[0].adet} adet geçmiş satış kaydı var. Veri bütünlüğü için silinemez!` 
            });
        }

        // Satışı yoksa sil (CRUD - Delete)
        await sequelize.query(`DELETE FROM urunler WHERE urun_id = ${urun_id}`);
        
        res.json({ success: true, message: "Ürün başarıyla silindi." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};