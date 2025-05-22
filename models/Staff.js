const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, required: true },
    licenseNumber: String,
    qualifications: String,
    phone: { type: String, required: true },
    email: { type: String, required: true },
    joinDate: { type: Date, required: true },
    address: String,
    emergencyContact: String,
    notes: String,
    active: { type: Boolean, default: true },
    userId: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
