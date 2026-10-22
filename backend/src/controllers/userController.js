const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { DEPARTMENTS, LEGACY_DEPARTMENT_MAP } = require('../constants/departments');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
};

const getEngineers = async (req, res, next) => {
  try {
    const query = { role: 'engineer' };
    if (!(req.user.role === 'admin' && req.query.includeInactive === 'true')) query.isActive = true;
    if (req.query.department) {
      const department = req.query.department;
      const legacyNames = Object.entries(LEGACY_DEPARTMENT_MAP)
        .filter(([, canonical]) => canonical === department)
        .map(([legacy]) => legacy);
      query.department = { $in: [department, ...legacyNames] };
    }
    const engineers = await User.find(query).select('-passwordHash').sort({ name: 1 }).lean();
    const normalizedEngineers = engineers.map((engineer) => ({
      ...engineer,
      department: LEGACY_DEPARTMENT_MAP[engineer.department] || engineer.department
    }));
    res.json({ success: true, data: normalizedEngineers });
  } catch (error) { next(error); }
};

const createEngineer = async (req, res, next) => {
  try {
    const { name, email, password, phone, department } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !DEPARTMENTS.includes(department?.trim()) || !password || password.length < 8) {
      res.status(400);
      throw new Error('Name, valid email, department, and a password of at least 8 characters are required');
    }

    if (await User.findOne({ email: normalizedEmail })) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const engineer = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim(),
      passwordHash,
      role: 'engineer',
      department: department.trim(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        _id: engineer._id,
        name: engineer.name,
        email: engineer.email,
        phone: engineer.phone,
        department: engineer.department,
        role: engineer.role,
        isActive: engineer.isActive
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      error.message = 'An account with this email already exists';
    }
    next(error);
  }
};

const setEngineerActive = async (req, res, next) => {
  try {
    if (!['true', 'false'].includes(String(req.body.isActive))) {
      res.status(400);
      throw new Error('isActive must be true or false');
    }
    const engineer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'engineer' },
      { isActive: req.body.isActive === true || req.body.isActive === 'true' },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!engineer) {
      res.status(404);
      throw new Error('Engineer account not found');
    }
    res.json({ success: true, data: engineer });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getEngineers, createEngineer, setEngineerActive };
