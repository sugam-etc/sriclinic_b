const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    // Patient Info
    patientName: {
      type: String,
      required: false, // Made optional for initial booking
    },
    patientSpecies: {
      type: String,
      required: false, // Made optional for initial booking
    },
    patientBreed: {
      type: String,
      required: false,
    },
    patientAge: {
      type: String,
      required: false,
    },
    patientId: {
      type: String,
      required: false, // Made optional for initial booking
    },

    // Owner Info
    ownerName: {
      type: String,
      required: false, // Made optional for initial booking
    },
    ownerPhone: {
      type: String,
      required: false, // Made optional for initial booking
    },

    // Vaccination Info
    vaccineName: {
      type: String,
      required: false, // Made optional for upcoming appointments
    },
    dateAdministered: {
      type: Date,
      required: false, // Made optional for upcoming appointments
    },
    nextDueDate: {
      type: Date,
      required: false,
    },
    batchNumber: {
      type: String,
      required: false,
    },
    manufacturer: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    // New field to distinguish between upcoming and completed
    status: {
      type: String,
      enum: ["upcoming", "completed"],
      default: "upcoming", // Default to upcoming
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vaccination", vaccinationSchema);
