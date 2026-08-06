// server/utils/businessRules.js
const VisitRequest = require('../models/VisitRequest');

/**
 * Helper to get current date formatted as YYYY-MM-DD
 */
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Helper to convert "HH:mm" time string to total minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + minutes;
};

/**
 * Validates all Business Rules prior to Visit Creation or State Transition
 */
const validateBusinessRules = async (action, data) => {
  const todayStr = getTodayDateString();
  const now = new Date();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  if (action === 'CREATE') {
    const { visitorId, hostEmployeeId, visitDate, expectedTime } = data;

    // Rule 3: Visit date cannot be earlier than current date
    if (visitDate < todayStr) {
      return { valid: false, message: 'Rule 3 Violation: Visit date cannot be earlier than today.' };
    }

    // Rule 4: For today's registrations, expected arrival time cannot be earlier than current time
    if (visitDate === todayStr && expectedTime) {
      const expMinutes = timeToMinutes(expectedTime);
      if (expMinutes < currentMinutes - 5) { // allow 5 mins tolerance for clock skew
        return { valid: false, message: "Rule 4 Violation: Expected arrival time cannot be earlier than current time." };
      }
    }

    // Rule 1: A visitor cannot have more than one active visit at the same time
    const activeVisit = await VisitRequest.findOne({
      visitor: visitorId,
      status: { $in: ['APPROVED', 'CHECKED_IN'] }
    });
    if (activeVisit) {
      return { valid: false, message: 'Rule 1 Violation: Visitor already has an active visit (Approved or Checked In).' };
    }

    // Rule 2: Duplicate visitor registrations for the same visitor on the same date should not be allowed
    const duplicateVisit = await VisitRequest.findOne({
      visitor: visitorId,
      visitDate: visitDate,
      status: { $ne: 'CANCELLED' }
    });
    if (duplicateVisit) {
      return { valid: false, message: 'Rule 2 Violation: Duplicate registration exists for this visitor on the selected date.' };
    }

    // Rule 5: An employee cannot have more than three pending visitor requests awaiting approval
    const pendingCount = await VisitRequest.countDocuments({
      hostEmployee: hostEmployeeId,
      status: 'PENDING'
    });
    if (pendingCount >= 3) {
      return { valid: false, message: 'Rule 5 Violation: Host employee already has 3 pending visitor requests awaiting approval.' };
    }

  } else if (action === 'CHECK_IN') {
    const { visitRequest } = data;

    // Rule 6 & 9: Visitors can only be checked in after approval. Rejected/other requests cannot be checked in.
    if (visitRequest.status !== 'APPROVED') {
      return { valid: false, message: `Rule 6 & 9 Violation: Cannot check in visit with status '${visitRequest.status}'. Only 'APPROVED' visits can be checked in.` };
    }

    // Rule 7: A visitor who is already checked in cannot be checked in again until checked out
    if (visitRequest.status === 'CHECKED_IN') {
      return { valid: false, message: 'Rule 7 Violation: Visitor is already checked in.' };
    }

  } else if (action === 'CHECK_OUT') {
    const { visitRequest, checkOutTime } = data;

    if (visitRequest.status !== 'CHECKED_IN') {
      return { valid: false, message: 'Only checked-in visitors can be checked out.' };
    }

    // Rule 8: Check-out time must always be later than check-in time
    if (visitRequest.checkInTime && new Date(checkOutTime) <= new Date(visitRequest.checkInTime)) {
      return { valid: false, message: 'Rule 8 Violation: Check-out time must be later than check-in time.' };
    }
  }

  return { valid: true };
};

module.exports = {
  getTodayDateString,
  timeToMinutes,
  validateBusinessRules
};
