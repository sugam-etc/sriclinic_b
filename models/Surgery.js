// Surgery.js
const mongoose = require("mongoose");

const surgerySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    surgeryType: {
      type: String,
      required: [true, "Surgery type is required"],
      trim: true,
    },
    surgeryDate: {
      type: Date,
      required: [true, "Surgery date is required"],
    },
    veterinarian: {
      type: String,
      required: [true, "Veterinarian name is required"],
      trim: true,
    },
    anesthesiaType: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in minutes
    },
    complications: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
surgerySchema.index({ patient: 1, surgeryDate: -1 });
surgerySchema.index({ surgeryType: 1 });

module.exports = mongoose.model("Surgery", surgerySchema);
