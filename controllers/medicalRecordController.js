const MedicalRecord = require("../models/medicalRecord.js");
const Patient = require("../models/Patient.js");

exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find().populate("patient");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate(
      "patient"
    );
    if (!record)
      return res.status(404).json({ message: "Medical record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMedicalRecord = async (req, res) => {
  try {
    const {
      patient: patientData, // This is patient info object sent from frontend
      vetenarian,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
    } = req.body;

    // 1. Check if patient exists (search by petId or name + ownerName)
    let patient = await Patient.findOne({ petId: patientData.petId });

    // 2. If patient doesn't exist, create it
    if (!patient) {
      patient = new Patient(patientData);
      await patient.save();
    } else {
      // 3. If patient exists, update info (optional)
      // Use Object.assign to update only the fields provided in patientData
      Object.assign(patient, patientData);
      await patient.save();
    }

    // 4. Create medical record linked to the patient's _id
    const medicalRecord = new MedicalRecord({
      patient: patient._id,
      vetenarian,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
    });

    await medicalRecord.save();

    // 5. Push this medical record into patient's medicalHistory array
    patient.medicalHistory.push(medicalRecord._id);
    await patient.save();

    res.status(201).json({ medicalRecord, patient });
  } catch (error) {
    console.error("Error creating medical record:", error); // Added for debugging
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const {
      patient: patientData, // Extract patientData object from the request body
      vetenarian,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
    } = req.body;

    // Find the existing medical record by ID
    let medicalRecord = await MedicalRecord.findById(req.params.id);
    if (!medicalRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Find the patient associated with this medical record using the patient ID stored in the medical record
    let patient = await Patient.findById(medicalRecord.patient);

    if (!patient) {
      // This case should ideally not happen if data integrity is maintained,
      // but handle it just in case the patient reference is broken.
      return res.status(404).json({ message: "Associated patient not found" });
    }

    // Update patient information using Object.assign to merge new data
    // This ensures only provided fields are updated, and others remain unchanged.
    Object.assign(patient, patientData);
    await patient.save(); // Save the updated patient document

    // Prepare the fields for updating the medical record itself
    const updateFields = {
      vetenarian,
      date,
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
    };

    // Filter out undefined values from updateFields to prevent overwriting with undefined
    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    // Update the medical record using findByIdAndUpdate
    // The 'patient' field in medicalRecord remains as an ObjectId and is not directly updated here
    medicalRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      updateFields, // Pass only the medical record specific fields for update
      { new: true, runValidators: true } // 'new: true' returns the updated document, 'runValidators: true' applies schema validation
    ).populate("patient"); // Populate the patient field to send back the full patient object in the response

    res.json(medicalRecord); // Send back the updated medical record with populated patient
  } catch (error) {
    console.error("Error updating medical record:", error); // Log the actual error for debugging
    // Check if the error is a Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    // For other errors, send a generic 400 with the error message
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
