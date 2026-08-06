// server/models/VisitRequest.js
const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  hostEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
    trim: true,
  },
  visitDate: {
    type: String, // YYYY-MM-DD format for clear date matching
    required: [true, 'Visit date is required'],
  },
  expectedTime: {
    type: String, // HH:mm format
    required: [true, 'Expected arrival time is required'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
    default: 'PENDING',
  },
  badgeNumber: {
    type: String,
    default: '',
  },
  checkInTime: {
    type: Date,
    default: null,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
  remarks: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('VisitRequest', visitRequestSchema);
