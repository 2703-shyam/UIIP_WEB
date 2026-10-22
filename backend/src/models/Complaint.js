const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  resolutionDetails: { type: String },
  resolutionImages: [{ type: String }],
  resolvedAt: { type: Date },
  issueType: { type: String },
  severity: { type: String },
  priority: { type: String },
  department: { type: String },
  aiDetection: {
    object: { type: String },
    primaryClass: { type: String },
    confidence: { type: Number },
    suggestedDepartment: { type: String },
    priority: { type: String },
    severity: { type: String },
    needsManualReview: { type: Boolean },
    isLiveCaptured: { type: Boolean, default: true },
    capturedAt: { type: Date }
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Submitted'
  },
  assignedEngineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eta: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
