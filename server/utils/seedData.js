// server/utils/seedData.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@control.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@321', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@control.com',
        phone: '+91 98765 43210',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'IT & Security',
        isActive: true,
      });
      console.log('✅ Default System Admin seeded: admin@control.com / Admin@321');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err);
  }
};

module.exports = seedAdminUser;
