const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: { type: String, required: [true, 'Shop name is required'], trim: true },
    phone: { type: String, required: [true, 'Shop phone is required'], trim: true },
    address: { type: String, required: [true, 'Shop address is required'], trim: true },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    image: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
      default: 'Pending',
    },
  }
);

shopSchema.index({ status: 1, latitude: 1, longitude: 1 });

module.exports = mongoose.model('Shop', shopSchema);
