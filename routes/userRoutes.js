import express from 'express';
import {
  getAllUsers,
  getMe,
  getUserById,
  getUserOrders,
  getUserProfileWithOrders,
  loginUser,
  logoutUser,
  placeOrder,
  registerUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/me', protect, getMe);
router.get('/profile', protect, getUserProfileWithOrders);
// Protected
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);

// Order Routes
router.post('/orders', protect, placeOrder);     // ✅ New

export default router;
