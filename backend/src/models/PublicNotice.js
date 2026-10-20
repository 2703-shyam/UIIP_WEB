const mongoose = require('mongoose');

const publicNoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Water Cutoff', 'Power Outage', 'Road Closure', 'General'], required: true },
  department: { type: String },
  affectedArea: { type: String },
  ward: { type: String },
  zone: { type: String },
  startAt: { type: Date },
  endAt: { type: Date },
  attachment: { type: String },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Published', 'Retracted'], default: 'Draft' },
  scheduledAt: { type: Date },
  publishedAt: { type: Date },
  retractedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('PublicNotice', publicNoticeSchema);
