const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g. "Antibiotic"
    unitName: { type: String, required: true },
    unit: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    supplier: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
