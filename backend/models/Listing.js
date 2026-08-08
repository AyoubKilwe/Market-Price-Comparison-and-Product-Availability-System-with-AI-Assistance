const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than zero'],
    },
    unit: {
      type: String,
      required: [true, 'Selling unit is required'],
      trim: true,
      default: '1 item',
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      required: [true, 'Stock status is required'],
    },
    isActive: { type: Boolean, default: true },
    priceHistory: [
      {
        price: { type: Number, required: true },
        stockStatus: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

listingSchema.index({ product: 1, shop: 1 }, { unique: true });

module.exports = mongoose.model('Listing', listingSchema);
