// server/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc Get all users / employees
// @route GET /api/users
// @access Admin, Receptionist (for host dropdown)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = { isActive: true };
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new User Account
// @route POST /api/users
// @access Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'EMPLOYEE',
      department: department || 'General',
      phone: phone || '',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle User Active Status / Delete
// @route DELETE /api/users/:id
// @access Admin
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, toggleUserActive };
