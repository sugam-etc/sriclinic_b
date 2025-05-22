const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    items: [saleItemSchema],
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "insurance", "online"],
      required: true,
    },
    taxRate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    totalBill: { type: Number, required: true }, // This is correctly defined as a Number
    notes: String,
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
