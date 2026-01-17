const express = require('express');
const router = express.Router();

// Controller'ları içe aktar
const authController = require('../controllers/authController');
const dataController = require('../controllers/dataController');

// --- Rotaları Tanımla ---

// Auth
router.post('/login', authController.login);

// Veri Analiz Rotaları
router.get('/sezon-trendi', dataController.getSezonTrendi);
router.get('/urun-analiz', dataController.getUrunAnaliz);
router.get('/cari-analiz', dataController.getCariAnaliz);
router.get('/bolge-performans', dataController.getBolgePerformans);

module.exports = router;