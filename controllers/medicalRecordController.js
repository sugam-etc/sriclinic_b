const MedicalRecord = require("../models/medicalRecord.js");

exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record)
      return res.status(404).json({ message: "Medical record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMedicalRecord = async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!record)
      return res.status(404).json({ message: "Medical record not found" });
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record)
      return res.status(404).json({ message: "Medical record not found" });
    res.json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
