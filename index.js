import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminAuthRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// ✅ Setup multiple allowed frontend origins from .env
const allowedOrigins = [
  process.env.USER_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean); // remove undefined/null entries

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middlewares
app.use(cookieParser());
app.use(express.json());

// ✅ API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
