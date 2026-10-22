const express = require('express');
const router = express.Router();
const { getUsers, getEngineers, createEngineer, setEngineerActive } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/engineers', protect, authorize('admin', 'citizen'), getEngineers);
router.post('/engineers', protect, authorize('admin'), createEngineer);
router.patch('/engineers/:id/status', protect, authorize('admin'), setEngineerActive);

module.exports = router;
