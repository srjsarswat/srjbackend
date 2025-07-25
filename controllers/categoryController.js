import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};

export const createCategory = async (req, res) => {
  const category = new Category(req.body);
  const saved = await category.save();
  res.status(201).json(saved);
};
