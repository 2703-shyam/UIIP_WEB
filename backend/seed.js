require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear existing users
    await User.deleteMany();
    console.log('Cleared existing users');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@uiip.com',
        phone: '1111111111',
        passwordHash,
        role: 'admin',
        department: 'Central Administration'
      },
      {
        name: 'John Engineer',
        email: 'engineer@uiip.com',
        phone: '2222222222',
        passwordHash,
        role: 'engineer',
        department: 'Water Supply',
        zone: 'North',
        ward: 'Ward 1'
      },
      {
        name: 'Jane Citizen',
        email: 'citizen@uiip.com',
        phone: '3333333333',
        passwordHash,
        role: 'citizen',
        location: { latitude: 22.3072, longitude: 72.6266 },
        zone: 'North',
        ward: 'Ward 1'
      }
    ];

    await User.insertMany(users);
    console.log('Database successfully seeded with dummy users!');
    console.log('Login passwords for all users are: password123');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
