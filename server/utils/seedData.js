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

    console.log('Seeding initial demo database...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Default Users (1 Admin, 1 Receptionist, 3 Employees)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'IT & Security',
      phone: '+1 555-0101',
    });

    const receptionist = await User.create({
      name: 'Sarah Receptionist',
      email: 'receptionist@system.com',
      password: hashedPassword,
      role: 'RECEPTIONIST',
      department: 'Front Desk',
      phone: '+1 555-0102',
    });

    const emp1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@system.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Engineering',
      phone: '+1 555-0103',
    });

    const emp2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@system.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Human Resources',
      phone: '+1 555-0104',
    });

    const emp3 = await User.create({
      name: 'David Lee',
      email: 'david@system.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Finance & Sales',
      phone: '+1 555-0105',
    });

    // 2. Create Sample Visitors
    const v1 = await Visitor.create({
      fullName: 'John Doe',
      email: 'johndoe@techcorp.com',
      phone: '+1 987-654-3210',
      company: 'TechCorp Solutions',
      governmentIdType: 'Passport',
      governmentIdNumber: 'P9876543',
    });

    const v2 = await Visitor.create({
      fullName: 'Emily Davis',
      email: 'emily@innovate.org',
      phone: '+1 987-654-3211',
      company: 'Innovate Labs',
      governmentIdType: 'Driving License',
      governmentIdNumber: 'DL-44321',
    });

    const v3 = await Visitor.create({
      fullName: 'Robert Vance',
      email: 'rvance@vancerefrigeration.com',
      phone: '+1 987-654-3212',
      company: 'Vance Refrigeration',
      governmentIdType: 'National ID',
      governmentIdNumber: 'NID-889900',
    });

    const today = getTodayDateString();

    // 3. Create Sample Visit Requests
    const visit1 = await VisitRequest.create({
      visitor: v1._id,
      hostEmployee: emp1._id,
      createdByUser: receptionist._id,
      purpose: 'Technical Project Consultation & Demo',
      visitDate: today,
      expectedTime: '10:30',
      status: 'CHECKED_IN',
      badgeNumber: 'VIP-001',
      checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
    });

    await ActivityLog.create({
      visitRequest: visit1._id,
      action: 'CREATED',
      performedBy: receptionist._id,
      details: 'Registered by Receptionist',
      timestamp: new Date(Date.now() - 7200000),
    });

    await ActivityLog.create({
      visitRequest: visit1._id,
      action: 'APPROVED',
      performedBy: emp1._id,
      details: 'Approved by Host Employee Alex',
      timestamp: new Date(Date.now() - 5400000),
    });

    await ActivityLog.create({
      visitRequest: visit1._id,
      action: 'CHECKED_IN',
      performedBy: receptionist._id,
      details: 'Badge assigned VIP-001',
      timestamp: new Date(Date.now() - 3600000),
    });

    // Visit 2: Pending
    const visit2 = await VisitRequest.create({
      visitor: v2._id,
      hostEmployee: emp2._id,
      createdByUser: receptionist._id,
      purpose: 'Interview for Senior Frontend Role',
      visitDate: today,
      expectedTime: '14:00',
      status: 'PENDING',
    });

    await ActivityLog.create({
      visitRequest: visit2._id,
      action: 'CREATED',
      performedBy: receptionist._id,
      details: 'Interview visitor registered',
      timestamp: new Date(Date.now() - 1800000),
    });

    // Visit 3: Checked Out
    const visit3 = await VisitRequest.create({
      visitor: v3._id,
      hostEmployee: emp3._id,
      createdByUser: receptionist._id,
      purpose: 'Vendor Equipment Delivery & Service',
      visitDate: today,
      expectedTime: '09:00',
      status: 'CHECKED_OUT',
      badgeNumber: 'V-042',
      checkInTime: new Date(Date.now() - 14400000),
      checkOutTime: new Date(Date.now() - 7200000),
    });

    await ActivityLog.create({
      visitRequest: visit3._id,
      action: 'CHECKED_OUT',
      performedBy: receptionist._id,
      details: 'Visitor completed visit and checked out',
      timestamp: new Date(Date.now() - 7200000),
    });

    console.log('✅ Demo database successfully seeded with default users and visits!');
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
};

module.exports = { seedDatabase };
