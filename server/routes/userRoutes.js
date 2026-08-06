// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUserPermanently } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUsers);
router.post('/', authorizeRoles('ADMIN'), createUser);
router.put('/:id', authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUserPermanently);

module.exports = router;
