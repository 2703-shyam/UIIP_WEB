const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const cloudinary = require('../config/cloudinary');
const { DEPARTMENTS } = require('../constants/departments');

const uploadImages = (files = []) => Promise.all(files.map((file) => new Promise((resolve) => {
  // If Cloudinary credentials are not provided in environment, fall back to base64 data URI
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                        process.env.CLOUDINARY_API_KEY;

  if (!hasCloudinary) {
    const base64 = file.buffer.toString('base64');
    return resolve(`data:${file.mimetype || 'image/jpeg'};base64,${base64}`);
  }

  cloudinary.uploader.upload_stream(
    { folder: 'uiip/complaints', resource_type: 'image' },
    (error, result) => {
      if (error || !result?.secure_url) {
        console.warn('Cloudinary upload warning, falling back to base64 data URI:', error?.message);
        const base64 = file.buffer.toString('base64');
        return resolve(`data:${file.mimetype || 'image/jpeg'};base64,${base64}`);
      }
      resolve(result.secure_url);
    }
  ).end(file.buffer);
})));

const createComplaint = async (req, res, next) => {
  try {
    const { description, locationName, latitude, longitude, aiDetection } = req.body;
    let parsedAiDetection = undefined;
    if (aiDetection) {
      try {
        parsedAiDetection = typeof aiDetection === 'string' ? JSON.parse(aiDetection) : aiDetection;
      } catch (e) {
        console.warn('Could not parse aiDetection:', e.message);
      }
    }

    let images = await uploadImages(req.files);
    // Robust fallback: check req.body if req.files had no files
    if ((!images || images.length === 0) && req.body.imageBase64) {
      const b64 = req.body.imageBase64;
      images = Array.isArray(b64) ? b64 : [b64];
    } else if ((!images || images.length === 0) && req.body.images) {
      const bImgs = req.body.images;
      images = Array.isArray(bImgs) ? bImgs : [bImgs];
    }

    const count = await Complaint.countDocuments();
    const currentYear = new Date().getFullYear();
    const complaintId = 'UIIP-' + currentYear + '-' + String(count + 1).padStart(6, '0');

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      description,
      images,
      aiDetection: parsedAiDetection,
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
    const complaints = await Complaint.find(query)
      .populate('assignedEngineerId', 'name email department')
      .populate('citizenId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) { next(error); }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedEngineerId', 'name email department phone')
      .populate('citizenId', 'name email phone')
      .populate('verifiedBy', 'name email department');
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    if (req.user.role === 'citizen' && complaint.citizenId?._id?.toString() !== req.user._id.toString() && complaint.citizenId?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this complaint');
    }
    if (req.user.role === 'engineer' && complaint.assignedEngineerId?._id?.toString() !== req.user._id.toString() && complaint.assignedEngineerId?.toString() !== req.user._id.toString()) {
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
    const { severity, priority, department } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }
    if (department && !DEPARTMENTS.includes(department)) {
      res.status(400);
      throw new Error(`Department must be one of: ${DEPARTMENTS.join(', ')}`);
    }
    const previousStatus = complaint.status;
    complaint.status = 'Verified';
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
    let resolutionImages = await uploadImages(req.files);
    if ((!resolutionImages || resolutionImages.length === 0) && req.body.resolutionImagesBase64) {
      const b64 = req.body.resolutionImagesBase64;
      resolutionImages = Array.isArray(b64) ? b64 : [b64];
    } else if ((!resolutionImages || resolutionImages.length === 0) && req.body.resolutionImages) {
      const bImgs = req.body.resolutionImages;
      resolutionImages = Array.isArray(bImgs) ? bImgs : [bImgs];
    }

    complaint.status = 'Resolved';
    complaint.resolutionDetails = req.body.resolutionDetails;
    complaint.resolutionImages = resolutionImages;
    complaint.resolvedAt = Date.now();
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
