// vaccinationController.js
const Vaccination = require("../models/Vaccination");
const Patient = require("../models/Patient");

// In your vaccinationController.js
exports.getAllVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find()
      .populate({
        path: "patient",
        select: "name species breed age ownerName ownerContact", // Only populate needed fields
      })
      // .populate("patient")
      .sort({ dateAdministered: -1 });

    res.json(vaccinations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVaccinationById = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id).populate({
      path: "patient",
      populate: {
        path: "client",
        model: "Client",
      },
    });
    if (!vaccination)
      return res.status(404).json({ message: "Vaccination not found" });
    res.json(vaccination);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// vaccinationController.js
exports.getVaccinationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient with populated client data
    const patient = await Patient.findById(patientId)
      .populate("client", "owner address contact email")
      .populate("vaccinationHistory");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get all vaccinations for this patient
    const vaccinations = await Vaccination.find({ patient: patientId }).sort({
      dateAdministered: -1,
    });

    res.json({
      patient: {
        _id: patient._id,
        name: patient.name,
        species: patient.species,
        breed: patient.breed,
        age: patient.age,
        petId: patient.petId,
        registrationNumber: patient.registrationNumber,
        ownerName: patient.client?.owner || "N/A",
        ownerContact: patient.client?.contact || "N/A",
        ownerEmail: patient.client?.email || "N/A",
        ownerAddress: patient.client?.address || "N/A",
      },
      vaccinations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVaccination = async (req, res) => {
  try {
    const { patient, vaccineName, dateAdministered, nextDueDate } = req.body;

    // Validate required vaccination fields
    if (!vaccineName || !dateAdministered || !nextDueDate || !patient) {
      return res.status(400).json({
        message:
          "Patient reference, vaccine name, date administered, and next due date are required",
      });
    }

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Create vaccination
    const vaccination = new Vaccination(req.body);
    await vaccination.save();

    // Update patient's vaccination history
    patientExists.vaccinationHistory.push(vaccination._id);
    await patientExists.save();

    res.status(201).json(vaccination);
  } catch (error) {
    console.error("Error creating vaccination:", error);
    res.status(400).json({ message: error.message });
  }
};
exports.updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("patient");

    if (!vaccination) {
      return res.status(404).json({ message: "Vaccination not found" });
    }

    res.json(vaccination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ message: "Vaccination not found" });
    }

    // Remove reference from patient's vaccinationHistory
    await Patient.findByIdAndUpdate(vaccination.patient, {
      $pull: { vaccinationHistory: vaccination._id },
    });

    res.json({ message: "Vaccination deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchVaccinations = async (req, res) => {
  try {
    const { patientName } = req.query;

    // Find patients matching the name
    const patients = await Patient.find({
      name: { $regex: patientName, $options: "i" },
    });

    if (patients.length === 0) {
      return res.json([]);
    }

    // Get vaccinations for these patients
    const vaccinations = await Vaccination.find({
      patient: { $in: patients.map((p) => p._id) },
    })
      .populate("patient")
      .sort({ dateAdministered: -1 });

    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
