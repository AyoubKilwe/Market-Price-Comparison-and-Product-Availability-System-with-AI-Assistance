const mongoose = require('mongoose');

const priceNotificationSchema = new mongoose.Schema({
  clientId: { type: String, required: true, trim: true, maxlength: 100, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  changeType: { type: String, enum: ['price_increase', 'price_decrease', 'stock_change', 'availability_change'], required: true },
  oldPrice: Number,
  newPrice: Number,
  oldStockStatus: String,
  newStockStatus: String,
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = mongoose.model('PriceNotification', priceNotificationSchema);
