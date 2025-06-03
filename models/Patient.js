const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    age: { type: String, required: true },
    breed: String,
    petId: { type: String, unique: true }, // Unique pet identifier
    sex: String,
    ownerName: { type: String, required: true },
    ownerContact: { type: String, required: true },
    lastAppointment: Date,
    nextAppointment: Date,
    medicalHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
