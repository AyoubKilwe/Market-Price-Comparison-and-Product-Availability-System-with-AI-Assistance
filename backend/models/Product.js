const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    unit: { type: String, trim: true, default: '1 unit' },
    image: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  }
);

productSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
