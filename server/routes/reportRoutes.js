// server/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getSummaryReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/summary', getSummaryReport);

module.exports = router;
