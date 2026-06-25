import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Electronics', 'Books', 'Fashion', 'Sports', 'Home', 'Beauty', 'Toys'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { 
    timestamps: true,
  }
);


productSchema.index({ updatedAt: -1, _id: -1 });
productSchema.index({ category: 1, updatedAt: -1, _id: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
