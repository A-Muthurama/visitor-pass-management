// server/utils/seedData.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const VisitRequest = require('../models/VisitRequest');
const ActivityLog = require('../models/ActivityLog');
const { getTodayDateString } = require('./businessRules');

const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already populated. Skipping initial seed.');
      return;
    }

    console.log('Seeding initial system admin account...');
    const adminPassword = await bcrypt.hash('Admin@321', 10);

    // 1. Create Default Admin User
    await User.create({
      name: 'System Admin',
      email: 'admin@control.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'IT & Security',
      phone: '+91 98765 00001',
    });

    console.log('✅ Base System Admin created (admin@control.com / Admin@321)! All other accounts will be created by Admin.');
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

module.exports = { seedDatabase };
