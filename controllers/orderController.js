// controllers/orderController.js
import Order from '../models/Order.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') // only return name & email of user
      .sort({ orderedAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};
