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

// @desc Update existing User Account
// @route PUT /api/users/:id
// @access Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.phone = phone !== undefined ? phone : user.phone;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
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

// @desc Permanently Delete User Account
// @route DELETE /api/users/:id
// @access Admin
const deleteUserPermanently = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User account deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUserPermanently };
