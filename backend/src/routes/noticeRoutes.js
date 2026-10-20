const express = require('express');
const router = express.Router();
const { createNotice, getNotices, getNoticeById, retractNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createNotice);
router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.delete('/:id', protect, authorize('admin'), retractNotice);

module.exports = router;
