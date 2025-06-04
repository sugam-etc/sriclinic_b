// controllers/vaccinationController.js
const Vaccination = require("../models/Vaccination"); // Correct path

// Get all records
const getAllVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find().sort({ createdAt: -1 });
    res.status(200).json(vaccinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
const getVaccinationById = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination)
      return res.status(404).json({ message: "Record not found" });
    res.status(200).json(vaccination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new
const createVaccination = async (req, res) => {
  try {
    const newVaccinationData = { ...req.body };
    // Set status to 'completed' only if both vaccineName and dateAdministered are provided
    if (newVaccinationData.vaccineName && newVaccinationData.dateAdministered) {
      newVaccinationData.status = "completed";
    } else {
      newVaccinationData.status = "upcoming"; // Otherwise, it's an upcoming appointment
    }

    const newVaccination = new Vaccination(newVaccinationData);
    await newVaccination.save();
    res.status(201).json(newVaccination);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update
const updateVaccination = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    // Set status to 'completed' only if both vaccineName and dateAdministered are now provided
    if (updatedData.vaccineName && updatedData.dateAdministered) {
      updatedData.status = "completed";
    } else {
      updatedData.status = "upcoming"; // Otherwise, it's an upcoming appointment
    }

    const updated = await Vaccination.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Record not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
const deleteVaccination = async (req, res) => {
  try {
    const deleted = await Vaccination.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.status(200).json({ message: "Vaccination deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search
const searchVaccinations = async (req, res) => {
  try {
    const { patientName, ownerPhone } = req.query;
    const filter = {};
    if (patientName) filter.patientName = new RegExp(patientName, "i");
    if (ownerPhone) filter.ownerPhone = ownerPhone;

    const records = await Vaccination.find(filter).sort({
      dateAdministered: -1,
    });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  searchVaccinations,
};
