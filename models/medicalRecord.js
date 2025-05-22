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
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientType: { type: String, required: true },
    ownerName: { type: String, required: true },
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
