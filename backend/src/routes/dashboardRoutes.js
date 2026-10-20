const express = require('express');
const router = express.Router();
const { getCitizenDashboard, getEngineerDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/citizen', protect, authorize('citizen'), getCitizenDashboard);
router.get('/engineer', protect, authorize('engineer'), getEngineerDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
