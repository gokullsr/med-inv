import AuditLog from "../models/AuditLog.js";

class AuditService {
  static async logAction(actionData) {
    try {
      const auditLog = new AuditLog({
        ...actionData,
        timestamp: new Date()
      });
      await auditLog.save();
      console.log(`✅ Audit log saved: ${actionData.action}`);
      return auditLog;
    } catch (error) {
      console.error("❌ Error saving audit log:", error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Inventory Actions
  static async logMedicineAdded(medicine, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'MEDICINE_ADDED',
      description: `Medicine "${medicine.name}" added to inventory`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      newData: medicine,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logMedicineUpdated(medicine, oldData, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'MEDICINE_UPDATED',
      description: `Medicine "${medicine.name}" updated`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      oldData: oldData,
      newData: medicine,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logMedicineDeleted(medicine, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'MEDICINE_DELETED',
      description: `Medicine "${medicine.name}" deleted from inventory`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      oldData: medicine,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // Sales Actions
  static async logSaleRecorded(sale, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'SALE_RECORDED',
      description: `Sale recorded for ${sale.medicine} to ${sale.customer} - ₹${sale.totalPrice}`,
      user: user,
      entityType: 'Sale',
      entityId: sale._id,
      newData: sale,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // Patient Actions
  static async logPatientAdded(patient, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'PATIENT_ADDED',
      description: `Patient "${patient.name}" registered`,
      user: user,
      entityType: 'Patient',
      entityId: patient._id,
      newData: patient,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logPatientUpdated(patient, oldData, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'PATIENT_UPDATED',
      description: `Patient "${patient.name}" updated`,
      user: user,
      entityType: 'Patient',
      entityId: patient._id,
      oldData: oldData,
      newData: patient,
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // Stock Actions
  static async logStockUpdate(medicine, oldQuantity, newQuantity, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'STOCK_ADJUSTED',
      description: `Stock updated for "${medicine.name}" from ${oldQuantity} to ${newQuantity}`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      oldData: { quantity: oldQuantity },
      newData: { quantity: newQuantity },
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // Alert Actions
  static async logLowStockAlert(medicine, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'LOW_STOCK_ALERT',
      description: `Low stock alert for "${medicine.name}" - ${medicine.quantity} units remaining`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      newData: { quantity: medicine.quantity },
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logExpiryAlert(medicine, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'EXPIRY_ALERT',
      description: `Expiry alert for "${medicine.name}" - expires on ${new Date(medicine.expiryDate).toLocaleDateString()}`,
      user: user,
      entityType: 'Medicine',
      entityId: medicine._id,
      newData: { expiryDate: medicine.expiryDate },
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // View Actions
  static async logInventoryViewed(user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'INVENTORY_VIEWED',
      description: 'Inventory list viewed',
      user: user,
      entityType: 'Inventory',
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logSalesViewed(user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'SALES_VIEWED',
      description: 'Sales history viewed',
      user: user,
      entityType: 'Sales',
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  static async logPatientsViewed(user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'PATIENTS_VIEWED',
      description: 'Patients list viewed',
      user: user,
      entityType: 'Patients',
      ipAddress: ip,
      userAgent: userAgent
    });
  }

  // System Actions
  static async logAuditLogsCleared(deletedCount, user = "System", ip = "Unknown", userAgent = "Unknown") {
    return await this.logAction({
      action: 'AUDIT_LOGS_CLEARED',
      description: `Audit logs cleared - ${deletedCount} records removed`,
      user: user,
      entityType: 'Audit',
      ipAddress: ip,
      userAgent: userAgent
    });
  }
}

export default AuditService;