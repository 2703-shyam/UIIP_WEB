const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  engineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  eta: { type: Date },
  status: { type: String, default: 'Active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
