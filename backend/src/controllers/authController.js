const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'citizen', location, ward, zone } = req.body;
    if (role !== 'citizen') {
      res.status(400);
      throw new Error('Engineer accounts must be created by an administrator');
    }
    const normalizedEmail = email?.trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password || password.length < 6) {
      res.status(400);
      throw new Error('Name, valid email, and a password of at least 6 characters are required');
    }
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      passwordHash,
      role,
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
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
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
