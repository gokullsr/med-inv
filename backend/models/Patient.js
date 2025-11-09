import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  condition: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);