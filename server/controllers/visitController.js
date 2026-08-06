// server/controllers/visitController.js
const VisitRequest = require('../models/VisitRequest');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { validateBusinessRules, getTodayDateString } = require('../utils/businessRules');

// Helper to log activities
const createLog = async (visitRequestId, action, performedByUserId, details = '') => {
  await ActivityLog.create({
    visitRequest: visitRequestId,
    action,
    performedBy: performedByUserId,
    details,
    timestamp: new Date(),
  });
};

// @desc Register Visitor & Create Visit Request
// @route POST /api/visits
// @access Receptionist, Admin
const createVisit = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      governmentIdType,
      governmentIdNumber,
      hostEmployeeId,
      purpose,
      visitDate,
      expectedTime,
    } = req.body;

    // 1. Find or create Visitor
    let visitor = await Visitor.findOne({ email: email.toLowerCase() });
    if (!visitor) {
      visitor = await Visitor.create({
        fullName,
        email,
        phone,
        company: company || 'N/A',
        governmentIdType: governmentIdType || 'National ID',
        governmentIdNumber: governmentIdNumber || '',
      });
    } else {
      // Update details if provided
      visitor.fullName = fullName || visitor.fullName;
      visitor.phone = phone || visitor.phone;
      if (company) visitor.company = company;
      await visitor.save();
    }

    // 2. Validate Business Rules (Rules 1, 2, 3, 4, 5)
    const ruleCheck = await validateBusinessRules('CREATE', {
      visitorId: visitor._id,
      hostEmployeeId,
      visitDate,
      expectedTime,
    });

    if (!ruleCheck.valid) {
      return res.status(400).json({ message: ruleCheck.message });
    }

    // 3. Create Visit Request
    const visitRequest = await VisitRequest.create({
      visitor: visitor._id,
      hostEmployee: hostEmployeeId,
      createdByUser: req.user._id,
      purpose,
      visitDate,
      expectedTime,
      status: 'PENDING',
    });

    // 4. Log Activity
    await createLog(visitRequest._id, 'CREATED', req.user._id, `Visit request created for ${visitor.fullName} visiting host employee.`);

    const populatedVisit = await VisitRequest.findById(visitRequest._id)
      .populate('visitor')
      .populate('hostEmployee', 'name email department phone')
      .populate('createdByUser', 'name role');

    res.status(201).json(populatedVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get visits with role-scoped filtering & search
// @route GET /api/visits
// @access All Authenticated Users (scoped)
const getVisits = async (req, res) => {
  try {
    const { status, date, search, startDate, endDate } = req.query;
    let query = {};

    // Role-based Scoping
    if (req.user.role === 'EMPLOYEE') {
      query.hostEmployee = req.user._id;
    }

    // Rule 10: Cancelled visits should not appear in active visitor lists unless explicitly filtered by status
    if (!status) {
      query.status = { $ne: 'CANCELLED' };
    } else {
      query.status = status;
    }

    if (date) {
      query.visitDate = date;
    } else if (startDate && endDate) {
      query.visitDate = { $gte: startDate, $lte: endDate };
    }

    let visits = await VisitRequest.find(query)
      .populate('visitor')
      .populate('hostEmployee', 'name email department')
      .populate('createdByUser', 'name role')
      .sort({ createdAt: -1 });

    // Search filtering (Visitor Name, Employee Name, Purpose, Badge)
    if (search) {
      const term = search.toLowerCase();
      visits = visits.filter(v => 
        (v.visitor && v.visitor.fullName.toLowerCase().includes(term)) ||
        (v.visitor && v.visitor.phone.includes(term)) ||
        (v.hostEmployee && v.hostEmployee.name.toLowerCase().includes(term)) ||
        (v.purpose && v.purpose.toLowerCase().includes(term)) ||
        (v.badgeNumber && v.badgeNumber.toLowerCase().includes(term))
      );
    }

    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve or Reject Visit Request
// @route PUT /api/visits/:id/status
// @access Employee (Host), Admin
const updateVisitStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body; // 'APPROVED' or 'REJECTED' or 'CANCELLED'
    const visitRequest = await VisitRequest.findById(req.params.id);

    if (!visitRequest) {
      return res.status(404).json({ message: 'Visit request not found' });
    }

    // Check authorization: Employee must be the host, or Admin
    if (req.user.role === 'EMPLOYEE' && visitRequest.hostEmployee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to visitor requests for other employees' });
    }

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified' });
    }

    visitRequest.status = status;
    if (remarks) visitRequest.remarks = remarks;
    await visitRequest.save();

    await createLog(visitRequest._id, status, req.user._id, remarks || `Status changed to ${status}`);

    const updated = await VisitRequest.findById(visitRequest._id)
      .populate('visitor')
      .populate('hostEmployee', 'name email department')
      .populate('createdByUser', 'name role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Check-In Visitor
// @route PUT /api/visits/:id/checkin
// @access Receptionist, Admin
const checkInVisitor = async (req, res) => {
  try {
    const { badgeNumber } = req.body;
    const visitRequest = await VisitRequest.findById(req.params.id).populate('visitor');

    if (!visitRequest) {
      return res.status(404).json({ message: 'Visit request not found' });
    }

    // Validate Rule 6, 7, 9
    const ruleCheck = await validateBusinessRules('CHECK_IN', { visitRequest });
    if (!ruleCheck.valid) {
      return res.status(400).json({ message: ruleCheck.message });
    }

    visitRequest.status = 'CHECKED_IN';
    visitRequest.checkInTime = new Date();
    if (badgeNumber) visitRequest.badgeNumber = badgeNumber;
    await visitRequest.save();

    await createLog(visitRequest._id, 'CHECKED_IN', req.user._id, `Visitor checked in. Assigned Badge: ${badgeNumber || 'N/A'}`);

    const updated = await VisitRequest.findById(visitRequest._id)
      .populate('visitor')
      .populate('hostEmployee', 'name email department');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Check-Out Visitor
// @route PUT /api/visits/:id/checkout
// @access Receptionist, Admin
const checkOutVisitor = async (req, res) => {
  try {
    const visitRequest = await VisitRequest.findById(req.params.id).populate('visitor');

    if (!visitRequest) {
      return res.status(404).json({ message: 'Visit request not found' });
    }

    const now = new Date();
    // Validate Rule 8
    const ruleCheck = await validateBusinessRules('CHECK_OUT', { visitRequest, checkOutTime: now });
    if (!ruleCheck.valid) {
      return res.status(400).json({ message: ruleCheck.message });
    }

    visitRequest.status = 'CHECKED_OUT';
    visitRequest.checkOutTime = now;
    await visitRequest.save();

    await createLog(visitRequest._id, 'CHECKED_OUT', req.user._id, 'Visitor checked out successfully');

    const updated = await VisitRequest.findById(visitRequest._id)
      .populate('visitor')
      .populate('hostEmployee', 'name email department');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get activity history logs
// @route GET /api/visits/:id/history
const getVisitHistory = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ visitRequest: req.params.id })
      .populate('performedBy', 'name role email')
      .sort({ timestamp: 1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVisit,
  getVisits,
  updateVisitStatus,
  checkInVisitor,
  checkOutVisitor,
  getVisitHistory,
};
