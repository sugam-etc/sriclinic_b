const express = require("express");
const router = express.Router();
const medicalRecordController = require("../controllers/medicalRecordController");

// Get all medical records
router.get("/", medicalRecordController.getAllMedicalRecords);

// Get a specific medical record by ID
router.get("/:id", medicalRecordController.getMedicalRecordById);

// Create a new medical record
router.post("/", medicalRecordController.createMedicalRecord);

// Create a new medical record only
router.post("/append", medicalRecordController.createMedicalRecordOnly);
// Update a medical record
router.put("/:id", medicalRecordController.updateMedicalRecord);

// Delete a medical record
router.delete("/:id", medicalRecordController.deleteMedicalRecord);

// Get all medical records for a specific patient
router.get(
  "/patient/:patientId",
  medicalRecordController.getMedicalRecordsByPatient
);

router.post("/:id/consent-forms", medicalRecordController.addConsentForm);
router.post(
  "/:id/medical-reports",
  medicalRecordController.addMedicalReportFile
);
router.post(
  "/:id/surgery-reports",
  medicalRecordController.addSurgeryReportFile
);
router.post(
  "/:id/vaccination-reports",
  medicalRecordController.addVaccinationReportFile
);
router.patch(
  "/:id/toggle-status",
  medicalRecordController.toggleTreatmentStatus
);
router.get(
  "/:recordId/files/:fileType/:fileId/download",
  medicalRecordController.downloadFile
);

// File delete route
router.delete(
  "/:recordId/files/:fileType/:fileId",
  medicalRecordController.deleteFile
);

module.exports = router;
