// server/routes/visitRoutes.js
const express = require('express');
const router = express.Router();
const {
  createVisit,
  getVisits,
  updateVisitStatus,
  checkInVisitor,
  checkOutVisitor,
  deleteVisit,
  clearAllData,
  getVisitHistory,
} = require('../controllers/visitController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorizeRoles('RECEPTIONIST', 'ADMIN'), createVisit);
router.get('/', getVisits);
router.put('/:id/status', authorizeRoles('EMPLOYEE', 'ADMIN'), updateVisitStatus);
router.put('/:id/checkin', authorizeRoles('RECEPTIONIST', 'ADMIN'), checkInVisitor);
router.put('/:id/checkout', authorizeRoles('RECEPTIONIST', 'ADMIN'), checkOutVisitor);
router.delete('/clear-all', authorizeRoles('ADMIN'), clearAllData);
router.delete('/:id', authorizeRoles('RECEPTIONIST', 'ADMIN'), deleteVisit);
router.get('/:id/history', getVisitHistory);

module.exports = router;
