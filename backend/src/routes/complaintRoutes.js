const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, getComplaintById, verifyComplaint, updateStatus, resolveComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, authorize('citizen'), upload.array('images', 4), createComplaint)
  .get(protect, getComplaints);

router.get('/:id', protect, getComplaintById);
router.put('/:id/verify', protect, authorize('admin'), verifyComplaint);
router.put('/:id/status', protect, authorize('engineer'), updateStatus);
router.post('/:id/resolve', protect, authorize('engineer'), upload.array('resolutionImages', 4), resolveComplaint);

module.exports = router;
