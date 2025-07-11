const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Medication name is required"],
    trim: true,
  },
  dosage: {
    type: String,
    trim: true,
  },
  quantity: {
    type: String,
    required: [true, "Quantity is required"],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, "Frequency is required"],
    trim: true,
  },
});

const vaccinationStatusSchema = new mongoose.Schema({
  rabies: {
    type: Boolean,
    default: false,
  },
  dhppil: {
    type: Boolean,
    default: false,
  },
  corona: {
    type: Boolean,
    default: false,
  },
  dewormed: {
    type: Boolean,
    default: false,
  },
});

const clinicalExaminationSchema = new mongoose.Schema({
  temperature: {
    type: String,
    description: "Body temperature in °C",
  },
  respiration: {
    type: String,
    description: "Respiratory rate per minute",
  },
  pulse: {
    type: String,
    description: "Heart rate per minute",
  },
  mucousMembranes: {
    type: String,
    description: "Mucous membrane assessment",
  },
  skin: {
    type: String,
    description: "Skin condition notes",
  },
  capillaryRefillTime: {
    type: String,
    description: "CRT in seconds",
  },
  weight: {
    type: Number,
    min: [0, "Weight cannot be negative"],
    required: [true, "Weight is required"],
    description: "Weight in kilograms (kg)",
  },
  bodyConditionScore: {
    type: Number,
    min: [1, "BCS cannot be less than 1"],
    max: [9, "BCS cannot be more than 9"],
    description: "BCS on 9-point scale",
  },
  hydrationStatus: {
    type: String,
    enum: ["Normal", "Dehydrated", "Overhydrated"],
  },
  otherFindings: {
    type: String,
    trim: true,
  },
});

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
      index: true,
    },
    veterinarian: {
      type: String,
      required: [true, "Veterinarian name is required"],
      trim: true,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
      required: [true, "Weight is required"],
      description: "Current weight in kg",
    },
    examination: {
      type: [String],
      trim: true,
    },
    previousHistory: {
      type: [String],
      trim: true,
    },
    pulseRate: {
      type: String,
      required: [true, "Pulse rate is required"],
    },
    treatmentPlan: {
      type: [String],
      required: [true, "Treatment plan is required"],
      trim: true,
    },
    clinicalSigns: {
      type: [String],
      required: [true, "Clinical signs are required"],
      trim: true,
    },
    conclusion: {
      type: String,
      required: [true, "Conclusion is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: [String],
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    treatment: {
      type: [String],
      trim: true,
    },
    medications: [medicationSchema],
    notes: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    progonosis: { type: String },
    clinicalFinding: { type: [String] },
    advice: {
      type: String,
      trim: true,
    },
    treatmentCompleted: {
      type: Boolean,
      default: false,
    },
    vaccinationStatus: vaccinationStatusSchema,
    clinicalExamination: clinicalExaminationSchema,
    consentForms: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    medicalReportFiles: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    surgeryReportFiles: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    vaccinationReportFiles: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
medicalRecordSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
