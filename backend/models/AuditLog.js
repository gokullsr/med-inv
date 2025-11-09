import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: [
      'MEDICINE_ADDED',
      'MEDICINE_UPDATED', 
      'MEDICINE_DELETED',
      'SALE_RECORDED',
      'PATIENT_ADDED',
      'STOCK_ADJUSTED',
      'LOW_STOCK_ALERT',
      'EXPIRY_ALERT'
    ]
  },
  description: { type: String, required: true },
  user: { type: String, default: "System" },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  oldData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String }
}, { 
  timestamps: true 
});

export default mongoose.model("AuditLog", auditLogSchema);