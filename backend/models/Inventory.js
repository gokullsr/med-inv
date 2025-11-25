// models/Inventory.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Medicine name is required"],
    trim: true,
    maxlength: [100, "Medicine name cannot exceed 100 characters"]
  },
  category: { 
    type: String, 
    default: "General",
    trim: true 
  },
  manufacturer: { 
    type: String, 
    default: "Unknown Manufacturer",
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0.01, "Price must be greater than 0"]
  },
  quantity: { 
    type: Number, 
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    default: 0
  },
  expiryDate: { 
    type: Date, 
    required: [true, "Expiry date is required"],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Expiry date must be in the future"
    }
  }
}, { 
  timestamps: true 
});

// Create index for faster searches
inventorySchema.index({ name: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;