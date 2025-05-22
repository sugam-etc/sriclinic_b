const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g. "Medicine", "Equipment", etc.
    unitName: { type: String, required: true }, // e.g. "bottle", "tablet"
    location: String,
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }, // general price if not medicine
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    manufacturer: { type: String },
    supplier: { type: String, required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    threshold: { type: Number, default: 10 },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
