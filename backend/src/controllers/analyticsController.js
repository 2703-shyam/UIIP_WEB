const Complaint = require('../models/Complaint');

const getComplaintAnalytics = async (req, res, next) => {
  try {
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: statusCounts });
  } catch (error) { next(error); }
};

module.exports = { getComplaintAnalytics };
