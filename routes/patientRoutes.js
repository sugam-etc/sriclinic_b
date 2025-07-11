const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const upload = require("../config/multerConfig");

// Get all patients
router.get("/", patientController.getAllPatients);
router.get("/client/:clientId", patientController.getPatientsByClient);

// Get a specific patient by ID
router.get("/:id", patientController.getPatientById);

// Get a patient by petId or registrationNumber
// Update the identifier route to make parameters optional
router.get("/identifier/:identifier", patientController.getPatientByIdentifier);

// Create a new patient
router.post("/", patientController.createPatient);

// Update a patient
router.put("/:id", patientController.updatePatient);

// Delete a patient
router.delete("/:id", patientController.deletePatient);

router.post("/:id/attachments", patientController.addAttachment);
router.delete(
  "/:id/attachments/:attachmentId",
  patientController.deleteAttachment
);
router.get(
  "/:id/attachments/:attachmentId/download",
  patientController.downloadAttachment
);

module.exports = router;
