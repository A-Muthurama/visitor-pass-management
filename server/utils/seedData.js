// server/utils/seedData.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@control.com';
    const hashedPassword = await bcrypt.hash('Admin@321', 10);

    // Delete existing admin records with alternate casing to prevent collisions
    await User.deleteMany({ email: { $regex: new RegExp('^admin@control.com$', 'i') } });

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      phone: '+91 98765 43210',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'IT & Security',
      isActive: true,
    });

    console.log('✅ Fresh Default System Admin seeded: admin@control.com / Admin@321');
  } catch (err) {
    console.error('Failed to seed admin user:', err);
  }
};

module.exports = seedAdminUser;
