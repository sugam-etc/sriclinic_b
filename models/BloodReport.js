const mongoose = require("mongoose");

const bloodReportSchema = new mongoose.Schema(
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
    sampleCollectedDate: {
      type: Date,
      required: true,
    },
    sampleTestedDate: {
      type: Date,
      required: true,
    },
    // Hematology
    hematology: {
      hb: { type: Number }, // gm/dL
      pcv: { type: Number }, // %
      tlc: { type: Number }, // 1000/µL
      neutrophils: { type: Number }, // %
      eosinophils: { type: Number }, // %
      basophils: { type: Number }, // %
      monocytes: { type: Number }, // %
      lymphocytes: { type: Number }, // %
      rbc: { type: Number }, // 10^6/µL
      platelets: { type: Number }, // 1000/µL
      mchc: { type: Number }, // %
      mch: { type: Number }, // pg
      mcv: { type: Number }, // fl
    },
    // Clinical Chemistry
    clinicalChemistry: {
      glucose: { type: Number }, // mg/dL
      albumin: { type: Number }, // gm/dL
      totalProtein: { type: Number }, // gm/dL
      bilirubinTotal: { type: Number }, // mg/dL
      bilirubinDirect: { type: Number }, // mg/dL
      alt: { type: Number }, // IU/L
      alp: { type: Number }, // IU/L
      bun: { type: Number }, // mg/dL
      creatinine: { type: Number }, // mg/dL
      sodium: { type: Number }, // mEq/l
      potassium: { type: Number }, // mEq/l
      chloride: { type: Number }, // mEq/l
      vitaminD: { type: Number }, // ng/ml
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
bloodReportSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("BloodReport", bloodReportSchema);
