// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Inventory from "./models/Inventory.js";
import Sale from "./models/Sale.js";
import Patient from "./models/Patient.js";
import AuditLog from "./models/AuditLog.js";
import AuditService from "./services/auditService.js";

dotenv.config();
const app = express();


app.use(cors({
  origin: ["https://your-app.vercel.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/medical_inventory")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.get("/api/inventory", async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    
 
    await AuditService.logInventoryViewed("System", req.ip, req.get('User-Agent'));
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    console.log("Received inventory data:", req.body);
    
    const { name, category, manufacturer, price, quantity, expiryDate } = req.body;

   
    if (!name || !price || !quantity || !expiryDate) {
      return res.status(400).json({ 
        error: "Missing required fields: name, price, quantity, expiryDate" 
      });
    }

   
    const existingMedicine = await Inventory.findOne({ 
      name: { $regex: new RegExp(name, 'i') } 
    });
    
    if (existingMedicine) {
      return res.status(400).json({ 
        error: `Medicine "${name}" already exists in inventory` 
      });
    }

    const newMedicine = new Inventory({
      name: name.trim(),
      category: category?.trim() || "General",
      manufacturer: manufacturer?.trim() || "Unknown Manufacturer",
      price: parseFloat(price),
      quantity: parseInt(quantity),
      expiryDate: new Date(expiryDate)
    });

    const savedMedicine = await newMedicine.save();
    
    
    await AuditService.logMedicineAdded(savedMedicine, "System", req.ip, req.get('User-Agent'));
    
    console.log("Medicine saved successfully:", savedMedicine);
    
    res.status(201).json({
      message: "Medicine added successfully",
      medicine: savedMedicine
    });
    
  } catch (err) {
    console.error("Error adding medicine:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ error: `Validation error: ${errors.join(', ')}` });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ error: "Medicine with this name already exists" });
    }
    
    res.status(500).json({ 
      error: "Failed to add medicine to database",
      details: err.message 
    });
  }
});


app.put("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingItem = await Inventory.findById(id);
    if (!existingItem) {
      return res.status(404).json({ error: "Medicine not found" });
    }

 
    const oldData = {
      name: existingItem.name,
      category: existingItem.category,
      manufacturer: existingItem.manufacturer,
      price: existingItem.price,
      quantity: existingItem.quantity,
      expiryDate: existingItem.expiryDate
    };

    const updatedMedicine = await Inventory.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

  
    await AuditService.logMedicineUpdated(updatedMedicine, oldData, "System", req.ip, req.get('User-Agent'));

    res.json({
      message: "Medicine updated successfully",
      medicine: updatedMedicine
    });
  } catch (err) {
    console.error("Error updating medicine:", err);
    res.status(400).json({ error: err.message });
  }
});


app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await Inventory.findById(id);
    if (!existingItem) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    await Inventory.findByIdAndDelete(id);

    
    await AuditService.logMedicineDeleted(existingItem, "System", req.ip, req.get('User-Agent'));

    res.json({ 
      message: "Medicine deleted successfully",
      deletedMedicine: existingItem
    });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(400).json({ error: err.message });
  }
});


app.get("/api/inventory/alerts", async (req, res) => {
  try {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);

    const alerts = await Inventory.find({
      $or: [
        { quantity: { $lt: 10 } },
        { expiryDate: { $lte: soon } },
      ],
    });

    
    if (alerts.length > 0) {
      for (const alert of alerts) {
        if (alert.quantity < 10) {
          await AuditService.logLowStockAlert(alert, "System", req.ip, req.get('User-Agent'));
        }
        if (alert.expiryDate <= soon) {
          await AuditService.logExpiryAlert(alert, "System", req.ip, req.get('User-Agent'));
        }
      }
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/sales", async (req, res) => {
  try {
    const { medicine, quantity, customer, condition } = req.body;
    console.log("📦 Sale request:", { medicine, quantity, customer, condition });

    
    const inventoryItem = await Inventory.findOne({ name: medicine });
    
    if (!inventoryItem) {
      return res.status(404).json({ error: "Medicine not found in inventory" });
    }

    
    if (inventoryItem.quantity < parseInt(quantity)) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${inventoryItem.quantity}, Requested: ${quantity}` 
      });
    }

    
    const oldQuantity = inventoryItem.quantity;

   
    const unitPrice = inventoryItem.price;
    const totalPrice = unitPrice * parseInt(quantity);

    
    inventoryItem.quantity -= parseInt(quantity);
    await inventoryItem.save();

    
    const sale = new Sale({
      medicine,
      quantity: parseInt(quantity),
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      customer,
      condition,
      date: new Date()
    });

    const savedSale = await sale.save();
    
    
    await AuditService.logSaleRecorded(savedSale, "System", req.ip, req.get('User-Agent'));
    await AuditService.logStockUpdate(inventoryItem, oldQuantity, inventoryItem.quantity, "System", req.ip, req.get('User-Agent'));
    
    res.status(201).json({
      sale: savedSale,
      updatedInventory: inventoryItem,
      priceDetails: {
        unitPrice,
        quantity: parseInt(quantity),
        totalPrice
      }
    });
    
  } catch (err) {
    console.error("❌ Sale error:", err);
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    
   
    await AuditService.logSalesViewed("System", req.ip, req.get('User-Agent'));
    
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/patients", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    
   
    await AuditService.logPatientAdded(savedPatient, "System", req.ip, req.get('User-Agent'));
    
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    
   
    await AuditService.logPatientsViewed("System", req.ip, req.get('User-Agent'));
    
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/audit-logs", async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType, startDate, endDate } = req.query;
    
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    
   
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/audit-logs/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalToday = await AuditLog.countDocuments({
      createdAt: { $gte: today }
    });

    
    const topActivities = await AuditLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      todayStats: stats,
      totalToday: totalToday,
      topActivities: topActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/api/audit-logs", async (req, res) => {
  try {
    const { days } = req.query;
    
    let filter = {};
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      filter.createdAt = { $lt: cutoffDate };
    }

    const result = await AuditLog.deleteMany(filter);

    
    await AuditService.logAction({
      action: 'AUDIT_LOGS_CLEARED',
      description: `Audit logs cleared - ${result.deletedCount} records removed`,
      user: "System",
      entityType: 'Audit',
      ipAddress: req.ip
    });

    res.json({
      message: `Successfully cleared ${result.deletedCount} audit log records`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/dashboard/overview", async (req, res) => {
  try {
    const [
      inventoryCount,
      lowStockCount,
      totalPatients,
      totalSales,
      revenueData,
      recentActivities
    ] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ quantity: { $lt: 10 } }),
      Patient.countDocuments(),
      Sale.countDocuments(),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]),
      AuditLog.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await Sale.countDocuments({ date: { $gte: today } });
    const todayRevenue = await Sale.aggregate([
      {
        $match: { date: { $gte: today } }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    res.json({
      inventory: {
        total: inventoryCount,
        lowStock: lowStockCount
      },
      patients: totalPatients,
      sales: {
        total: totalSales,
        today: todaySales
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        today: todayRevenue[0]?.revenue || 0,
        totalQuantity: revenueData[0]?.totalQuantity || 0
      },
      recentActivities: recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    res.json({
      status: "healthy",
      database: dbStatus,
      collections: collectionNames,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: "unhealthy",
      error: err.message 
    });
  }
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;