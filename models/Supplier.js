const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Added unique to name for easier lookup
    company: { type: String, required: true },
    PAN: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String, required: true },
    supplyHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
