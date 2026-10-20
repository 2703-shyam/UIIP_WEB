const express = require('express');
const router = express.Router();
const { getUsers, getEngineers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/engineers', protect, authorize('admin', 'citizen'), getEngineers);

module.exports = router;
