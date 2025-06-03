const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    // Patient Info
    patientName: {
      type: String,
      required: true,
    },
    patientSpecies: {
      type: String,
      required: true,
    },
    patientBreed: {
      type: String,
    },
    patientAge: {
      type: String,
    },
    patientId: {
      type: String,
      required: true,
    },

    // Owner Info
    ownerName: {
      type: String,
      required: true,
    },
    ownerPhone: {
      type: String,
    },

    // Vaccination Info
    vaccineName: {
      type: String,
      required: true,
    },
    dateAdministered: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vaccination", vaccinationSchema);
