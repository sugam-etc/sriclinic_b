const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,
  quantity: { type: Number, required: true, min: 1 },
  duration: { type: String, required: true },
  frequency: { type: String, required: true },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    vetenarian: { type: String, required: true },
    date: { type: Date, default: Date.now },
    diagnosis: { type: String, required: true },
    treatment: String,
    medications: [medicationSchema],
    notes: String,
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
