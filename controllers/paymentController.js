import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js'; 

export const createOrder = async (req, res) => {
  try {
    console.log("reached");

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: req.body.amount, // ✅ no need to multiply again
      currency: 'INR',
      receipt: `receipt_order_${Math.random()}`,
    };

    const order = await instance.orders.create(options);
    console.log("finished");
    res.status(200).json({ success: true, order });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      products,
      totalAmount,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // ✅ 1. Save to central Order collection
    const savedOrder = await Order.create({
      user: userId,
      products,
      totalAmount,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    });

    // ✅ 2. Push into user's embedded orders array
    const user = await User.findById(userId);
    if (user) {
      user.orders.push({
        products,
        totalAmount,
        status: 'confirmed', // or keep as 'pending'
        orderedAt: new Date(),
      });

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified & order saved',
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};