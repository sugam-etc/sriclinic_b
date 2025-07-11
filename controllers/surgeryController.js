// surgeryController.js
const Surgery = require("../models/Surgery");
const Patient = require("../models/Patient");

exports.getAllSurgeries = async (req, res) => {
  try {
    const surgeries = await Surgery.find()
      .populate("patient")
      .sort({ surgeryDate: -1 });
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSurgeryById = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id).populate("patient");
    if (!surgery) return res.status(404).json({ message: "Surgery not found" });
    res.json(surgery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSurgeriesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const surgeries = await Surgery.find({ patient: patientId })
      .sort({ surgeryDate: -1 })
      .populate("patient");
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSurgery = async (req, res) => {
  try {
    const { patientId, ...surgeryData } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const surgery = new Surgery({
      ...surgeryData,
      patient: patientId,
    });

    await surgery.save();

    // Update patient's surgery history
    patient.surgeryHistory = patient.surgeryHistory || [];
    patient.surgeryHistory.push(surgery._id);
    await patient.save();

    res.status(201).json(surgery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("patient");

    if (!surgery) {
      return res.status(404).json({ message: "Surgery not found" });
    }

    res.json(surgery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findByIdAndDelete(req.params.id);
    if (!surgery) {
      return res.status(404).json({ message: "Surgery not found" });
    }

    // Remove reference from patient's surgeryHistory
    await Patient.findByIdAndUpdate(surgery.patient, {
      $pull: { surgeryHistory: surgery._id },
    });

    res.json({ message: "Surgery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
