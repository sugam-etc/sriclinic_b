const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    age: { type: String, required: true },
    breed: String,
    petCode: { type: String, unique: true },
    sex: String,
    ownerName: { type: String, required: true },
    ownerContact: { type: String, required: true },

    lastAppointment: Date,
    nextAppointment: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
