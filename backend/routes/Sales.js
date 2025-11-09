import express from "express";
import Sale from "../models/Sale.js";
import Inventory from "../models/Inventory.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record new sale
router.post("/", async (req, res) => {
  try {
    const { medicine, quantity, customer, condition } = req.body;

    // Find the medicine in inventory
    const inventoryItem = await Inventory.findOne({ name: medicine });
    
    if (!inventoryItem) {
      return res.status(404).json({ error: "Medicine not found in inventory" });
    }

    // Check stock
    if (inventoryItem.quantity < parseInt(quantity)) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${inventoryItem.quantity}, Requested: ${quantity}` 
      });
    }

    // Calculate prices
    const unitPrice = inventoryItem.price;
    const totalPrice = unitPrice * parseInt(quantity);

    // Update inventory
    const oldQuantity = inventoryItem.quantity;
    inventoryItem.quantity -= parseInt(quantity);
    await inventoryItem.save();

    // Create sale record
    const sale = new Sale({
      medicine,
      quantity: parseInt(quantity),
      unitPrice,
      totalPrice,
      customer,
      condition,
      date: new Date()
    });

    const savedSale = await sale.save();
    
    // Log actions
    await AuditLog.create({
      action: 'SALE_RECORDED',
      description: `Sale recorded for ${medicine} to ${customer} - ₹${totalPrice}`,
      user: "System",
      entityType: 'Sale',
      entityId: savedSale._id,
      newData: savedSale
    });

    await AuditLog.create({
      action: 'STOCK_ADJUSTED',
      description: `Stock updated for "${medicine}" from ${oldQuantity} to ${inventoryItem.quantity}`,
      user: "System",
      entityType: 'Medicine',
      entityId: inventoryItem._id,
      oldData: { quantity: oldQuantity },
      newData: { quantity: inventoryItem.quantity }
    });
    
    res.status(201).json({
      sale: savedSale,
      updatedInventory: inventoryItem,
      priceDetails: { unitPrice, quantity: parseInt(quantity), totalPrice }
    });
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;