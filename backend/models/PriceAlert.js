const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  clientId: { type: String, required: true, trim: true, maxlength: 100, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

priceAlertSchema.index({ clientId: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
