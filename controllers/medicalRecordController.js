const MedicalRecord = require("../models/medicalRecord");
const Patient = require("../models/Patient");
const upload = require("../config/multerConfig");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Helper function to handle file uploads
const handleFileUploads = (req) => {
  const fileTypes = [
    "consentForms",
    "medicalReportFiles",
    "surgeryReportFiles",
    "vaccinationReportFiles",
  ];

  const filesToAdd = {};

  fileTypes.forEach((type) => {
    if (req.files && req.files[type]) {
      const files = Array.isArray(req.files[type])
        ? req.files[type]
        : [req.files[type]];

      filesToAdd[type] = files.map((file) => ({
        fileName: file.originalname,
        filePath: path.join("uploads", path.basename(file.path)), // Store relative path
        fileType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
    }
  });

  return filesToAdd;
};

// Helper function to parse JSON fields
const parseJSONFields = (req) => {
  const fieldsToParse = [
    "medications",
    "vaccinationStatus",
    "clinicalExamination",
    "examination",
    "previousHistory",
    "treatmentPlan",
    "clinicalSigns",
    "diagnosis",
    "treatment",
    "clinicalFinding",
  ];

  fieldsToParse.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (err) {
        console.error(`Error parsing ${field}:`, err);
      }
    }
  });
};

exports.createMedicalRecord = [
  upload.fields([
    { name: "consentForms", maxCount: 7 },
    { name: "medicalReportFiles", maxCount: 7 },
    { name: "surgeryReportFiles", maxCount: 7 },
    { name: "vaccinationReportFiles", maxCount: 7 },
  ]),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      parseJSONFields(req);

      // Validate required fields
      const requiredFields = [
        "petId",
        "veterinarian",
        "weight",
        "pulseRate",
        "conclusion",
        "diagnosis",
      ];

      const missingFields = requiredFields.filter((field) => !req.body[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Find patient within transaction
      const patient = await Patient.findOne({
        $or: [
          { _id: req.body.petId },
          { registrationNumber: req.body.registrationNumber },
        ],
      }).session(session);

      if (!patient) {
        throw new Error("Patient not found");
      }

      // Create new medical record (never updates existing)
      const medicalRecord = new MedicalRecord({
        patient: patient._id,
        ...req.body,
        ...handleFileUploads(req),
      });

      // Save medical record
      await medicalRecord.save({ session });

      // Update patient's medical history
      patient.medicalHistory.push(medicalRecord._id);
      patient.lastAppointment = new Date();
      if (req.body.followUpDate) {
        patient.nextAppointment = new Date(req.body.followUpDate);
      }
      await patient.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(medicalRecord);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Clean up uploaded files if error occurred
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          if (Array.isArray(files)) {
            files.forEach((file) => {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            });
          }
        });
      }

      res.status(400).json({
        message: error.message,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
];
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("patient")
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate({
      path: "patient",
      populate: {
        path: "client",
        model: "Client",
      },
    });
    if (!record)
      return res.status(404).json({ message: "Medical record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMedicalRecordOnly = [
  upload.fields([
    { name: "consentForms", maxCount: 7 },
    { name: "medicalReportFiles", maxCount: 7 },
    { name: "surgeryReportFiles", maxCount: 7 },
    { name: "vaccinationReportFiles", maxCount: 7 },
  ]),
  async (req, res) => {
    try {
      // Parse JSON fields first
      parseJSONFields(req);

      const {
        petId,
        registrationNumber,
        veterinarian,
        weight,
        examination,
        previousHistory,
        pulseRate,
        treatmentPlan,
        clinicalSigns,
        progonosis,
        clinicalFinding,
        conclusion,
        diagnosis,
        reason,
        treatment,
        medications,
        notes,
        followUpDate,
        advice,
        treatmentCompleted,
        vaccinationStatus,
        clinicalExamination,
      } = req.body;

      let patient = await Patient.findOne({ _id: petId });

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const medicalRecord = new MedicalRecord({
        patient: patient._id,
        veterinarian,
        weight,
        examination: Array.isArray(examination) ? examination : [examination],
        previousHistory: Array.isArray(previousHistory)
          ? previousHistory
          : [previousHistory],
        registrationNumber,
        pulseRate,
        treatmentPlan: Array.isArray(treatmentPlan)
          ? treatmentPlan
          : [treatmentPlan],
        progonosis,
        clinicalFinding: Array.isArray(clinicalFinding)
          ? clinicalFinding
          : [clinicalFinding],
        clinicalSigns: Array.isArray(clinicalSigns)
          ? clinicalSigns
          : [clinicalSigns],
        conclusion,
        diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
        reason,
        treatment: Array.isArray(treatment) ? treatment : [treatment],
        medications: Array.isArray(medications) ? medications : [medications],
        notes,
        followUpDate,
        advice,
        treatmentCompleted:
          treatmentCompleted === "true" || treatmentCompleted === true,
        vaccinationStatus,
        clinicalExamination,
      });

      handleFileUploads(req, medicalRecord);
      await medicalRecord.save();

      patient.medicalHistory.push(medicalRecord._id);
      patient.lastAppointment = new Date();
      if (followUpDate) {
        patient.nextAppointment = followUpDate;
      }
      await patient.save();

      res.status(201).json(medicalRecord);
    } catch (error) {
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          if (Array.isArray(files)) {
            files.forEach((file) => {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            });
          }
        });
      }
      console.error("Error creating medical record:", error);
      res.status(400).json({ message: error.message });
    }
  },
];

exports.updateMedicalRecord = [
  upload.fields([
    { name: "consentForms", maxCount: 7 },
    { name: "medicalReportFiles", maxCount: 7 },
    { name: "surgeryReportFiles", maxCount: 7 },
    { name: "vaccinationReportFiles", maxCount: 7 },
  ]),
  async (req, res) => {
    try {
      // Parse JSON fields first
      parseJSONFields(req);

      const {
        veterinarian,
        weight,
        examination,
        previousHistory,
        pulseRate,
        treatmentPlan,
        clinicalSigns,
        progonosis,
        clinicalFinding,
        conclusion,
        diagnosis,
        reason,
        treatment,
        medications,
        notes,
        followUpDate,
        advice,
        treatmentCompleted,
        vaccinationStatus,
        clinicalExamination,
      } = req.body;

      const updateData = {
        veterinarian,
        weight,
        examination: Array.isArray(examination) ? examination : [examination],
        previousHistory: Array.isArray(previousHistory)
          ? previousHistory
          : [previousHistory],
        pulseRate,
        treatmentPlan: Array.isArray(treatmentPlan)
          ? treatmentPlan
          : [treatmentPlan],
        clinicalSigns: Array.isArray(clinicalSigns)
          ? clinicalSigns
          : [clinicalSigns],
        progonosis,
        clinicalFinding: Array.isArray(clinicalFinding)
          ? clinicalFinding
          : [clinicalFinding],
        conclusion,
        diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
        reason,
        treatment: Array.isArray(treatment) ? treatment : [treatment],
        medications: Array.isArray(medications) ? medications : [medications],
        notes,
        followUpDate,
        advice,
        treatmentCompleted:
          treatmentCompleted === "true" || treatmentCompleted === true,
        vaccinationStatus,
        clinicalExamination,
      };

      const medicalRecord = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("patient");

      if (!medicalRecord) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      handleFileUploads(req, medicalRecord);
      await medicalRecord.save();

      if (followUpDate) {
        await Patient.findByIdAndUpdate(medicalRecord.patient._id, {
          nextAppointment: followUpDate,
        });
      }

      res.json(medicalRecord);
    } catch (error) {
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          if (Array.isArray(files)) {
            files.forEach((file) => {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            });
          }
        });
      }
      console.error("Error updating medical record:", error);
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({ message: messages.join(", ") });
      }
      res.status(400).json({ message: error.message });
    }
  },
];

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Delete associated files
    const fileTypes = [
      "consentForms",
      "medicalReportFiles",
      "surgeryReportFiles",
      "vaccinationReportFiles",
    ];
    fileTypes.forEach((type) => {
      if (record[type] && record[type].length > 0) {
        record[type].forEach((file) => {
          if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
          }
        });
      }
    });

    await Patient.findByIdAndUpdate(record.patient, {
      $pull: { medicalHistory: record._id },
    });

    res.json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const records = await MedicalRecord.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .populate("patient");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const fileType = req.params.fileType;
    const fileId = req.params.fileId;

    if (!record[fileType]) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const file = record[fileType].id(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found in record" });
    }

    // The filePath should already be relative to the uploads directory
    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(file.filePath)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, file.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteFile = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const fileType = req.params.fileType;
    const fileId = req.params.fileId;

    if (!record[fileType]) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const file = record[fileType].id(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Construct absolute path from relative path
    const absolutePath = path.join(__dirname, "..", file.filePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    record[fileType].pull(fileId);
    await record.save();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addConsentForm = [
  upload.single("consentForm"),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      record.consentForms.push({
        fileName: req.file.originalname,
        filePath: path.join("uploads", path.basename(req.file.path)),
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      });

      await record.save();
      res.status(201).json(record);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  },
];

exports.addMedicalReportFile = [
  upload.single("medicalReport"),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      record.medicalReportFiles.push({
        fileName: req.file.originalname,
        filePath: path.join("uploads", path.basename(req.file.path)),
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      });

      await record.save();
      res.status(201).json(record);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  },
];

exports.addSurgeryReportFile = [
  upload.single("surgeryReport"),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      record.surgeryReportFiles.push({
        fileName: req.file.originalname,
        filePath: path.join("uploads", path.basename(req.file.path)),
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      });

      await record.save();
      res.status(201).json(record);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  },
];

exports.addVaccinationReportFile = [
  upload.single("vaccinationReport"),
  async (req, res) => {
    try {
      const record = await MedicalRecord.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      record.vaccinationReportFiles.push({
        fileName: req.file.originalname,
        filePath: path.join("uploads", path.basename(req.file.path)),
        fileType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      });

      await record.save();
      res.status(201).json(record);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  },
];
exports.toggleTreatmentStatus = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Toggle the treatmentCompleted status
    record.treatmentCompleted = !record.treatmentCompleted;
    await record.save();

    res.json({
      success: true,
      treatmentCompleted: record.treatmentCompleted,
      message: `Treatment status updated to ${
        record.treatmentCompleted ? "Completed" : "Ongoing"
      }`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
