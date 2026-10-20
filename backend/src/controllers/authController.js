const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'citizen', department, location, ward, zone } = req.body;
    if (!['citizen', 'engineer'].includes(role)) {
      res.status(400);
      throw new Error('Invalid registration role');
    }
    if (role === 'engineer' && !department) {
      res.status(400);
      throw new Error('Department is required for engineer accounts');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      department: role === 'engineer' ? department : undefined,
      location,
      ward,
      zone
    });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) { next(error); }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        res.status(401);
        throw new Error('Account is inactive');
      }
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: generateToken(user._id),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

module.exports = { registerUser, loginUser, getMe };
