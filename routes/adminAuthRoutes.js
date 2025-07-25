import express from 'express';
import {
  createAdmin,
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUser,
  getAdminStats,
} from '../controllers/adminAuthController.js';
import { verifyAdmin } from '../middleware/adminAuthMiddleware.js';
import { getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/create', createAdmin); // ❗One-time use
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/users', verifyAdmin, getAllUsers);
router.delete('/users/:id', verifyAdmin, deleteUser);
router.get('/stats', verifyAdmin, getAdminStats);
router.get('/orders', verifyAdmin, getAllOrders);


export default router;
