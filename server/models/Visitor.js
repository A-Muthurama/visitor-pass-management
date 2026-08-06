// server/models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  company: {
    type: String,
    default: 'N/A',
    trim: true,
  },
  governmentIdType: {
    type: String,
    enum: ['National ID', 'Passport', 'Driving License', 'Other'],
    default: 'National ID',
  },
  governmentIdNumber: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Visitor', visitorSchema);
