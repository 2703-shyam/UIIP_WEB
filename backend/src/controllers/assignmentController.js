const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');

const createAssignment = async (req, res, next) => {
  try {
    const { complaintId, engineerId, eta } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.status !== 'Verified') {
      res.status(400);
      throw new Error('Complaint not found or not Verified');
    }
    const assignment = await Assignment.create({
      complaintId,
      engineerId,
      assignedBy: req.user._id,
      eta
    });
    const previousStatus = complaint.status;
    complaint.status = 'Assigned';
    complaint.assignedEngineerId = engineerId;
    complaint.eta = eta;
    await complaint.save();
    await StatusHistory.create({
      complaintId: complaint._id,
      previousStatus,
      newStatus: 'Assigned',
      changedBy: req.user._id,
      comment: 'Assigned to engineer'
    });
    res.status(201).json({ success: true, message: 'Engineer assigned', data: assignment });
  } catch (error) { next(error); }
};

module.exports = { createAssignment };
