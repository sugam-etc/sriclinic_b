const express = require("express");
const router = express.Router();
const bloodReportController = require("../controllers/bloodReportController");

// Get all blood reports
router.get("/", bloodReportController.getAllBloodReports);

// Get a specific blood report by ID
router.get("/:id", bloodReportController.getBloodReportById);

// Create a new blood report
router.post("/", bloodReportController.createBloodReport);

// Update a blood report
router.put("/:id", bloodReportController.updateBloodReport);

// Delete a blood report
router.delete("/:id", bloodReportController.deleteBloodReport);

// Get blood reports by patient ID
router.get(
  "/patient/:patientId",
  bloodReportController.getBloodReportsByPatient
);

module.exports = router;
