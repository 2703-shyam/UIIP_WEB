const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  noticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicNotice' },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
