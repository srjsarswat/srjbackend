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
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);


export default router;
