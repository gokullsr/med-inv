import express from "express";
import Inventory from "../models/Inventory.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new medicine
router.post("/", async (req, res) => {
  try {
    const { name, category, manufacturer, price, quantity, expiryDate } = req.body;

    // Validate required fields
    if (!name || !price || !quantity || !expiryDate) {
      return res.status(400).json({ 
        error: "Missing required fields: name, price, quantity, expiryDate" 
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
    
    // Log the action
    await AuditLog.create({
      action: 'MEDICINE_ADDED',
      description: `Medicine "${savedMedicine.name}" added to inventory`,
      user: "System",
      entityType: 'Medicine',
      entityId: savedMedicine._id,
      newData: savedMedicine
    });
    
    res.status(201).json(savedMedicine);
    
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Medicine with this name already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update medicine
router.put("/:id", async (req, res) => {
  try {
    const medicine = await Inventory.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    await AuditLog.create({
      action: 'MEDICINE_UPDATED',
      description: `Medicine "${medicine.name}" updated`,
      user: "System",
      entityType: 'Medicine',
      entityId: medicine._id,
      newData: medicine
    });

    res.json(medicine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete medicine
router.delete("/:id", async (req, res) => {
  try {
    const medicine = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    await AuditLog.create({
      action: 'MEDICINE_DELETED',
      description: `Medicine "${medicine.name}" deleted from inventory`,
      user: "System",
      entityType: 'Medicine',
      entityId: medicine._id,
      oldData: medicine
    });

    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;