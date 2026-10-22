const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const PublicNotice = require('../models/PublicNotice');
const { LEGACY_DEPARTMENT_MAP } = require('../constants/departments');

const normalizeLegacyDepartments = async () => {
  await Complaint.collection.updateMany(
    { issueType: { $exists: true } },
    { $unset: { issueType: '' } }
  );

  for (const [legacy, department] of Object.entries(LEGACY_DEPARTMENT_MAP)) {
    await User.updateMany({ role: 'engineer', department: legacy }, { $set: { department } });
    await Complaint.updateMany({ department: legacy }, { $set: { department } });
    await Complaint.updateMany(
      { 'aiDetection.suggestedDepartment': legacy },
      { $set: { 'aiDetection.suggestedDepartment': department } }
    );
    await PublicNotice.updateMany({ department: legacy }, { $set: { department } });
  }
};

const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@uiip.com';
    const adminPassword = 'Admin@123';

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        phone: '1111111111',
        passwordHash,
        role: 'admin',
        department: null,
        isActive: true
      });

      console.log(`Default admin created: ${adminEmail} / ${adminPassword}`);
      return adminUser;
    }

    if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
    }
    adminUser.department = null;
    await adminUser.save();

    if (!(await bcrypt.compare(adminPassword, adminUser.passwordHash))) {
      const salt = await bcrypt.genSalt(10);
      adminUser.passwordHash = await bcrypt.hash(adminPassword, salt);
      await adminUser.save();
    }

    console.log(`Default admin ensured: ${adminEmail}`);
    return adminUser;
  } catch (error) {
    console.error(`Error ensuring default admin: ${error.message}`);
    throw error;
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureDefaultAdmin();
    await normalizeLegacyDepartments();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.ensureDefaultAdmin = ensureDefaultAdmin;
