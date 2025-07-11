// patientController.js
const Patient = require("../models/Patient");
const Client = require("../models/Client");
const MedicalRecord = require("../models/medicalRecord");
const upload = require("../config/multerConfig");
const path = require("path");
const fs = require("fs");

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("client")
      .populate("medicalHistory")
      .populate("vaccinationHistory")
      .populate("bloodReports")
      .populate("surgeryHistory")
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("client")
      .populate("medicalHistory")
      .populate("vaccinationHistory")
      .populate("bloodReports")
      .populate("surgeryHistory");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    if (!identifier) {
      return res.status(400).json({ message: "Please provide an identifier" });
    }

    let patient;

    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      patient = await Patient.findById(identifier)
        .populate("client")
        .populate("medicalHistory")
        .populate("vaccinationHistory")
        .populate("bloodReports")
        .populate("surgeryHistory");
    }

    if (!patient) {
      patient = await Patient.findOne({
        $or: [{ petId: identifier }, { registrationNumber: identifier }],
      })
        .populate("client")
        .populate("medicalHistory")
        .populate("vaccinationHistory")
        .populate("bloodReports")
        .populate("surgeryHistory");
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { clientId, ...patientData } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if patient with same petId or registrationNumber already exists
    const existingPatient = await Patient.findOne({
      $or: [
        { petId: patientData.petId },
        { registrationNumber: patientData.registrationNumber },
      ],
    });

    if (existingPatient) {
      return res.status(400).json({
        message: "Patient with this ID or registration number already exists",
      });
    }

    const patient = new Patient({
      ...patientData,
      client: clientId,
    });

    await patient.save();

    // Add patient to client's patients array
    client.patients.push(patient._id);
    await client.save();

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { petId, registrationNumber } = req.body;

    if (petId || registrationNumber) {
      const existingPatient = await Patient.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          { $or: [{ petId }, { registrationNumber }] },
        ],
      });

      if (existingPatient) {
        return res.status(400).json({
          message:
            "Another patient already uses this petId or registrationNumber",
        });
      }
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Remove patient reference from client
    await Client.findByIdAndUpdate(patient.client, {
      $pull: { patients: patient._id },
    });

    // Delete all associated medical records
    await MedicalRecord.deleteMany({ patient: patient._id });

    res.json({
      message: "Patient and associated records deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPatientsByClient = async (req, res) => {
  try {
    const patients = await Patient.find({ client: req.params.clientId })
      .populate("client")
      .populate("medicalHistory")
      .populate("vaccinationHistory")
      .populate("bloodReports")
      .populate("surgeryHistory");

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addAttachment = [
  upload.single("attachment"),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Store only the filename (relative path)
      const fileName = req.file.filename;

      patient.attachments.push({
        fileName: req.file.originalname,
        filePath: fileName, // Store only the filename
        fileType: req.file.mimetype,
        size: req.file.size,
        description: req.body.description || "",
        uploadedAt: new Date(),
      });

      await patient.save();

      res.status(201).json({
        message: "File uploaded successfully",
        attachment: {
          ...patient.attachments[patient.attachments.length - 1],
          url: `/uploads/${fileName}`, // Return the URL path
        },
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        message: "File upload failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
];

exports.downloadAttachment = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const attachmentId = req.params.attachmentId;
    const attachment = patient.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Construct path based on stored filename
    const filePath = path.join(__dirname, "../uploads", attachment.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, attachment.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const attachmentId = req.params.attachmentId;
    const attachment = patient.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Construct path based on stored filename
    const filePath = path.join(__dirname, "../uploads", attachment.filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    patient.attachments.pull(attachmentId);
    await patient.save();

    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
