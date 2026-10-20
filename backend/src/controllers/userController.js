const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
};

const getEngineers = async (req, res, next) => {
  try {
    const query = { role: 'engineer' };
    if (req.query.department) query.department = req.query.department;
    const engineers = await User.find(query).select('-passwordHash');
    res.json({ success: true, data: engineers });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getEngineers };
