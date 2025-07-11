const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    company: { type: String },
    PAN: { type: String }, // Permanent Account Number (if applicable)
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    supplyHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem", // Reference to InventoryItem
      },
    ], // Array to store IDs of inventory items supplied
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
