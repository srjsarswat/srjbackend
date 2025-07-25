import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid token or admin not found.' });
    }

    req.admin = admin; // Attach admin info to request
    console.log(req.admin);
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
