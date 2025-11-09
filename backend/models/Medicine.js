const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  category: { type: String, default: 'General' } // e.g., Antibiotics, Painkillers
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);