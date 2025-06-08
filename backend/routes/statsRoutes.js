const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et des privilèges d'administrateur
router.use(authenticateToken);
router.use(isAdmin);

// Routes pour les statistiques
router.get('/dashboard', statsController.getDashboardStats);
router.get('/users', statsController.getUserStats);
router.get('/transactions', statsController.getTransactionStats);

module.exports = router;
