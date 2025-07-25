import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: [{ type: String }], // Optional: could also be a single string if needed
    price: { type: Number, required: true },
    
    // ✅ Now supports multiple images
    image: [{ type: String, required: true }], 
    
    category: { type: String, required: true },
    subCategory: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
