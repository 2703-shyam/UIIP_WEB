const express = require('express');
const router = express.Router();
const { getComplaintAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/complaints', protect, authorize('admin'), getComplaintAnalytics);

module.exports = router;
