const mongoose = require('mongoose');

const customerActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['search', 'compare', 'view', 'shop_view'], required: true, index: true },
  query: { type: String, trim: true, maxlength: 100, default: '' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null, index: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null, index: true },
  visitorId: { type: String, trim: true, maxlength: 100, default: '', index: true },
}, { timestamps: true });

customerActivitySchema.index({ type: 1, createdAt: -1 });
customerActivitySchema.index({ shop: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerActivity', customerActivitySchema);
