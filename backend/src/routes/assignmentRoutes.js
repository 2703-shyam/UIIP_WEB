const express = require('express');
const router = express.Router();
const { createAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createAssignment);

module.exports = router;
