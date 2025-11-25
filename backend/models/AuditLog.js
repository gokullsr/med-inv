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
      'PATIENT_UPDATED',
      'STOCK_ADJUSTED',
      'LOW_STOCK_ALERT',
      'EXPIRY_ALERT',
      'AUDIT_LOGS_CLEARED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'INVENTORY_VIEWED',
      'SALES_VIEWED',
      'PATIENTS_VIEWED'
    ]
  },
  description: { type: String, required: true },
  user: { type: String, default: "System" },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  oldData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index for better query performance
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ user: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;