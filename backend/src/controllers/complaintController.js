const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const cloudinary = require('../config/cloudinary');

const uploadImages = (files = []) => Promise.all(files.map((file) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { folder: 'uiip/complaints', resource_type: 'image' },
    (error, result) => error ? reject(error) : resolve(result.secure_url)
  ).end(file.buffer);
})));

const createComplaint = async (req, res, next) => {
  try {
    const { issueType, description, locationName, latitude, longitude } = req.body;
    const images = await uploadImages(req.files);
    const count = await Complaint.countDocuments();
    const currentYear = new Date().getFullYear();
    const complaintId = 'UIIP-' + currentYear + '-' + String(count + 1).padStart(6, '0');

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      issueType,
      description,
      images,
      location: {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        address: locationName || undefined
      },
      status: 'Submitted'
    });

    await StatusHistory.create({
      complaintId: complaint._id,
      newStatus: 'Submitted',
      changedBy: req.user._id,
      comment: 'Complaint created'
    });

    res.status(201).json({ success: true, message: 'Complaint created successfully', data: complaint });
  } catch (error) { next(error); }
};

const getComplaints = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    } else if (req.user.role === 'engineer') {
      query.assignedEngineerId = req.user._id;
    }
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) { next(error); }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('assignedEngineerId', 'name');
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this complaint');
    }
    if (req.user.role === 'engineer' && complaint.assignedEngineerId?._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not assigned to this complaint');
    }
    const data = complaint.toObject();
    data.history = await StatusHistory.find({ complaintId: complaint._id }).sort({ createdAt: 1 });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const verifyComplaint = async (req, res, next) => {
  try {
    const { issueType, severity, priority, department } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    const previousStatus = complaint.status;
    complaint.status = 'Verified';
    complaint.issueType = issueType || complaint.issueType;
    complaint.severity = severity || complaint.severity;
    complaint.priority = priority || complaint.priority;
    complaint.department = department || complaint.department;
    complaint.verifiedBy = req.user._id;
    complaint.verifiedAt = Date.now();

    await complaint.save();
    await StatusHistory.create({
      complaintId: complaint._id,
      previousStatus,
      newStatus: 'Verified',
      changedBy: req.user._id,
      comment: 'Complaint verified by admin'
    });

    res.json({ success: true, message: 'Complaint verified', data: complaint });
  } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    if (!complaint.assignedEngineerId || complaint.assignedEngineerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not assigned to this complaint');
    }
    if (status !== 'In Progress') {
      res.status(400);
      throw new Error('Unsupported status update');
    }
    const previousStatus = complaint.status;
    complaint.status = status;
    await complaint.save();
    await StatusHistory.create({
      complaintId: complaint._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user._id,
      comment: comment || 'Status updated'
    });
    res.json({ success: true, message: 'Status updated', data: complaint });
  } catch (error) { next(error); }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    if (!complaint.assignedEngineerId || complaint.assignedEngineerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not assigned to this complaint');
    }

    const previousStatus = complaint.status;
    complaint.status = 'Resolved';
    complaint.resolutionDetails = req.body.resolutionDetails;
    complaint.resolutionImages = await uploadImages(req.files);
    await complaint.save();
    await StatusHistory.create({
      complaintId: complaint._id,
      previousStatus,
      newStatus: 'Resolved',
      changedBy: req.user._id,
      comment: req.body.resolutionDetails || 'Complaint resolved'
    });
    res.json({ success: true, message: 'Complaint resolved', data: complaint });
  } catch (error) { next(error); }
};

module.exports = { createComplaint, getComplaints, getComplaintById, verifyComplaint, updateStatus, resolveComplaint };
