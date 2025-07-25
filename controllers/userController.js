import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';


const JWT_SECRET = process.env.JWT_SECRET || 'aman123'; // Use .env in production

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res
            .status(201)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .json({
                message: 'User registered successfully',
                user: { _id: user._id, name: user.name, email: user.email },
            });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error in getMe:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        console.log(email, password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                message: 'Login successful',
                user: { _id: user._id, name: user.name, email: user.email },
            });
    } catch (err) {
        res.status(500).json({ message: 'Login error' });
    }
};


export const logoutUser = async (req, res) => {
    res
        .clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production', // use true in production
        })
        .status(200)
        .json({ message: 'Logout successful' });
};


export const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
};

export const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log("userid",userId);
  
  const { products, totalAmount } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('No products provided');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // ✅ Push order into user's orders array
  user.orders.push({ products, totalAmount });
  await user.save();

  res.status(201).json({ message: 'Order placed successfully' });
});


export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const user = await User.findById(userId).populate('orders.products.productId', 'name price image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Optionally sort orders by date descending (latest first)
  const sortedOrders = [...user.orders].sort(
    (a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)
  );

  res.status(200).json(sortedOrders);
});

// controllers/userController.js

export const getUserProfileWithOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId)
    .select('-password') // exclude password
    .populate('orders.products.productId', 'name price image');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});
