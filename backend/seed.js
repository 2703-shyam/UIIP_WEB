require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    const adminEmail = 'admin@uiip.com';
    const adminPassword = 'Admin@123';
    const demoPassword = 'password123';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash(adminPassword, salt);
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        phone: '1111111111',
        passwordHash: adminPasswordHash,
        role: 'admin',
        department: 'Central Administration'
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      if (!(await bcrypt.compare(adminPassword, adminUser.passwordHash))) {
        adminUser.passwordHash = await bcrypt.hash(adminPassword, salt);
        await adminUser.save();
      }
      adminUser.role = 'admin';
      await adminUser.save();
    }

    const demoPasswordHash = await bcrypt.hash(demoPassword, await bcrypt.genSalt(10));
    const demoUsers = [
      {
        name: 'John Engineer',
        email: 'engineer@uiip.com',
        phone: '2222222222',
        passwordHash: demoPasswordHash,
        role: 'engineer',
        department: 'Water Supply',
        zone: 'North',
        ward: 'Ward 1'
      },
      {
        name: 'Jane Citizen',
        email: 'citizen@uiip.com',
        phone: '3333333333',
        passwordHash: demoPasswordHash,
        role: 'citizen',
        location: { latitude: 22.3072, longitude: 72.6266 },
        zone: 'North',
        ward: 'Ward 1'
      }
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
      }
    }

    console.log('Database ensured with admin account and demo users!');
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
    console.log(`Demo login password: ${demoPassword}`);

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
