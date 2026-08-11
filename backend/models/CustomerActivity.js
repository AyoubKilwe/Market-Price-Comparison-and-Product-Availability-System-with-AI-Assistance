const mongoose = require('mongoose');

const customerActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['search', 'compare', 'view'], required: true, index: true },
  query: { type: String, trim: true, maxlength: 100, default: '' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
}, { timestamps: true });

customerActivitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerActivity', customerActivitySchema);
