const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    clientName: { type: String, required: true },
    petName: { type: String, required: true },
    petType: { type: String, required: true },
    petAge: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    reason: { type: String, required: true },
    contactNumber: { type: String, required: true },
    notes: String,
    vetName: { type: String, required: true },
    followUpDate: Date,
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
