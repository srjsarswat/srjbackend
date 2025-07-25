import express from 'express';
import {
  getProducts,
  createProduct,
  getProductsByCategory,
  deleteProduct,
  updateProduct,
  getProductById
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/category/:slug', getProductsByCategory);
router.post('/', createProduct);
router.delete('/:id', deleteProduct);
router.put('/:id', updateProduct);
router.get('/:id', getProductById);

export default router;
