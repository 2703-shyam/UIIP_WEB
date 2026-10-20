const Complaint = require('../models/Complaint');
const PublicNotice = require('../models/PublicNotice');

const getCitizenDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments({ citizenId: req.user._id });
    const activeComplaints = await Complaint.countDocuments({ citizenId: req.user._id, status: { $ne: 'Resolved' } });
    const recentComplaints = await Complaint.find({ citizenId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, data: { totalComplaints, activeComplaints, recentComplaints } });
  } catch (error) { next(error); }
};

const getEngineerDashboard = async (req, res, next) => {
  try {
    const assignedComplaints = await Complaint.countDocuments({ assignedEngineerId: req.user._id });
    const inProgressComplaints = await Complaint.countDocuments({ assignedEngineerId: req.user._id, status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ assignedEngineerId: req.user._id, status: 'Resolved' });
    res.json({ success: true, data: { assignedComplaints, inProgressComplaints, resolvedComplaints } });
  } catch (error) { next(error); }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const activeNotices = await PublicNotice.countDocuments({ status: 'Published' });
    res.json({ success: true, data: { totalComplaints, activeNotices } });
  } catch (error) { next(error); }
};

module.exports = { getCitizenDashboard, getEngineerDashboard, getAdminDashboard };
