import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  customer: { type: String, required: true },
  condition: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Sale", saleSchema);