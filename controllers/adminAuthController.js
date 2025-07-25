import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // required for getAllUsers
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// ✅ Create Admin (One-time API)
export const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin creation failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Login Admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    console.log("reached");
    

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log(admin.password);
    
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    console.log(isMatch);
    

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res
      .cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'Login successful',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Logout Admin
export const logoutAdmin = (req, res) => {
  res
    .clearCookie('adminToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const usersWithOrders = await User.find({ 'orders.0': { $exists: true } });

    let todayOrders = 0;

    usersWithOrders.forEach(user => {
      user.orders.forEach(order => {
        const orderDate = new Date(order.createdAt || order.orderedAt);
        if (orderDate >= todayStart) {
          todayOrders++;
        }
      });
    });

    res.status(200).json({
      totalUsers,
      todayOrders,
      totalProducts,
      totalCategories
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
