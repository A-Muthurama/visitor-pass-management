// server/controllers/reportController.js
const VisitRequest = require('../models/VisitRequest');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const { getTodayDateString } = require('../utils/businessRules');

// @desc Get Dashboard Statistics according to Role
// @route GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDateString();
    let stats = {};

    if (req.user.role === 'ADMIN') {
      const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', isActive: true });
      const todayVisitors = await VisitRequest.countDocuments({ visitDate: today, status: { $ne: 'CANCELLED' } });
      const currentlyInside = await VisitRequest.countDocuments({ status: 'CHECKED_IN' });
      const pendingRequests = await VisitRequest.countDocuments({ status: 'PENDING' });
      const scheduledVisitors = await VisitRequest.countDocuments({ visitDate: { $gte: today }, status: 'APPROVED' });

      stats = {
        totalEmployees,
        todayVisitors,
        currentlyInside,
        pendingRequests,
        scheduledVisitors,
      };
    } else if (req.user.role === 'RECEPTIONIST') {
      const todayVisitors = await VisitRequest.countDocuments({ visitDate: today, status: { $ne: 'CANCELLED' } });
      const currentlyInside = await VisitRequest.countDocuments({ status: 'CHECKED_IN' });
      const todayPending = await VisitRequest.countDocuments({ visitDate: today, status: 'PENDING' });
      const todayApproved = await VisitRequest.countDocuments({ visitDate: today, status: 'APPROVED' });

      stats = {
        todayVisitors,
        currentlyInside,
        todayPending,
        todayApproved,
      };
    } else if (req.user.role === 'EMPLOYEE') {
      const pendingRequests = await VisitRequest.countDocuments({ hostEmployee: req.user._id, status: 'PENDING' });
      const todayApprovedVisits = await VisitRequest.countDocuments({ hostEmployee: req.user._id, visitDate: today, status: 'APPROVED' });
      const activeVisitorsInside = await VisitRequest.countDocuments({ hostEmployee: req.user._id, status: 'CHECKED_IN' });
      const totalHistory = await VisitRequest.countDocuments({ hostEmployee: req.user._id });

      stats = {
        pendingRequests,
        todayApprovedVisits,
        activeVisitorsInside,
        totalHistory,
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Summary Visitor Reports with Date Range Filters & Charts
// @route GET /api/reports/summary
const getSummaryReport = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    const today = new Date();
    let start, end;

    if (range === 'today') {
      start = getTodayDateString();
      end = start;
    } else if (range === 'week') {
      const pastWeek = new Date(today);
      pastWeek.setDate(today.getDate() - 7);
      start = pastWeek.toISOString().split('T')[0];
      end = getTodayDateString();
    } else if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      // Default past 30 days
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      start = past30.toISOString().split('T')[0];
      end = getTodayDateString();
    }

    const visits = await VisitRequest.find({
      visitDate: { $gte: start, $lte: end }
    }).populate('visitor').populate('hostEmployee', 'name department');

    const total = visits.length;
    const approved = visits.filter(v => v.status === 'APPROVED').length;
    const rejected = visits.filter(v => v.status === 'REJECTED').length;
    const checkedIn = visits.filter(v => v.status === 'CHECKED_IN').length;
    const checkedOut = visits.filter(v => v.status === 'CHECKED_OUT').length;
    const cancelled = visits.filter(v => v.status === 'CANCELLED').length;

    // Daily breakdown for charts
    const dailyMap = {};
    visits.forEach(v => {
      dailyMap[v.visitDate] = (dailyMap[v.visitDate] || 0) + 1;
    });

    const dailyTrends = Object.keys(dailyMap).sort().map(date => ({
      date,
      count: dailyMap[date]
    }));

    res.json({
      range: range || 'custom',
      startDate: start,
      endDate: end,
      metrics: {
        total,
        approved,
        rejected,
        checkedIn,
        checkedOut,
        cancelled,
      },
      dailyTrends,
      recentVisits: visits.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getSummaryReport };
