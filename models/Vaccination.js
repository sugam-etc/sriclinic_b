const mongoose = require("mongoose");

const vaccinationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    vaccineName: {
      type: String,
      required: [true, "Vaccine name is required"],
    },
    dateAdministered: {
      type: Date,
      required: [true, "Date administered is required"],
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: [true, "Next due date is required"],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    administeringVeterinarian: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // You can also include vaccination-specific fields
    isBooster: {
      type: Boolean,
      default: false,
    },
    routeOfAdministration: {
      type: String,
      enum: ["Subcutaneous", "Intramuscular", "Oral", "Intranasal"],
    },
    reactionObserved: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
vaccinationSchema.index({ patient: 1, dateAdministered: -1 });
vaccinationSchema.index({ vaccineName: 1 });
vaccinationSchema.index({ nextDueDate: 1 });

module.exports = mongoose.model("Vaccination", vaccinationSchema);
