// models/Sale.js
import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  customer: { type: String, required: true },
  condition: { type: String, required: true }, // Added condition field
  date: { type: Date, default: Date.now },
});

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;