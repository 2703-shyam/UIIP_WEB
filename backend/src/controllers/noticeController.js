const PublicNotice = require('../models/PublicNotice');
const { DEPARTMENTS } = require('../constants/departments');

const createNotice = async (req, res, next) => {
  try {
    if (req.body.department && !DEPARTMENTS.includes(req.body.department)) {
      res.status(400);
      throw new Error(`Department must be one of: ${DEPARTMENTS.join(', ')}`);
    }
    const noticeData = {
      ...req.body,
      status: 'Published',
      publishedAt: new Date(),
      createdBy: req.user._id
    };
    if (!noticeData.startAt) delete noticeData.startAt;
    if (!noticeData.endAt) delete noticeData.endAt;
    const notice = await PublicNotice.create(noticeData);
    res.status(201).json({ success: true, message: 'Notice created', data: notice });
  } catch (error) { next(error); }
};

const getNotices = async (req, res, next) => {
  try {
    const notices = await PublicNotice.find({ status: 'Published' }).sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (error) { next(error); }
};

const getNoticeById = async (req, res, next) => {
  try {
    const notice = await PublicNotice.findOne({ _id: req.params.id, status: 'Published' });
    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
};

const retractNotice = async (req, res, next) => {
  try {
    const notice = await PublicNotice.findByIdAndUpdate(
      req.params.id,
      { status: 'Retracted', retractedAt: new Date() },
      { new: true }
    );
    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
};

module.exports = { createNotice, getNotices, getNoticeById, retractNotice };
