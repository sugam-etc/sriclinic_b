// Patient.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    species: {
      type: String,
      enum: ["Canine", "Feline"],
      required: [true, "Species is required"],
    },
    age: {
      type: String,
      required: [true, "Age is required"],
    },
    breed: {
      type: String,
      trim: true,
    },
    petId: {
      type: String,
      unique: true,
      index: true,
      description: "Unique patient identifier",
    },
    registrationNumber: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Registration number is required"],
      description: "Official registration/license number",
    },
    sex: {
      type: String,
      enum: ["MALE", "FEMALE", "UNKNOWN"],
      uppercase: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client reference is required"],
    },
    lastAppointment: {
      type: Date,
    },
    nextAppointment: {
      type: Date,
    },
    medicalHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],
    vaccinationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vaccination",
      },
    ],
    bloodReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BloodReport",
      },
    ],
    surgeryHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surgery",
      },
    ],
    attachments: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        size: Number,
        description: {
          type: String,
          trim: true,
        },
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
patientSchema.index({ name: 1, client: 1 });
patientSchema.index({ registrationNumber: 1 }, { unique: true });
patientSchema.index({ petId: 1 }, { unique: true });

module.exports = mongoose.model("Patient", patientSchema);
