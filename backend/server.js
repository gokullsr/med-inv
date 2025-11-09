import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes with proper named imports
import inventoryRoutes from "./routes/inventory.js";
import salesRoutes from "./routes/sales.js";
import patientsRoutes from "./routes/patients.js";
import auditRoutes from "./routes/audit.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medical_inventory";
mongoose.connect(MONGODB_URI)
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/audit", auditRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "healthy",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: "unhealthy",
      error: err.message 
    });
  }
});

// Dashboard data endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    const [inventory, sales, patients] = await Promise.all([
      mongoose.connection.collection('inventories').find({}).toArray(),
      mongoose.connection.collection('sales').find({}).toArray(),
      mongoose.connection.collection('patients').find({}).toArray()
    ]);

    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    const lowStockItems = inventory.filter(item => item.quantity < 10);
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    res.json({
      inventoryCount: inventory.length,
      totalSales: sales.length,
      totalPatients: patients.length,
      totalRevenue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      recentSales: sales.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));