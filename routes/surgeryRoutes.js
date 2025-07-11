// surgeryRoutes.js
const express = require("express");
const router = express.Router();
const surgeryController = require("../controllers/surgeryController");

router.get("/", surgeryController.getAllSurgeries);
router.get("/:id", surgeryController.getSurgeryById);
router.get("/patient/:patientId", surgeryController.getSurgeriesByPatient);
router.post("/", surgeryController.createSurgery);
router.put("/:id", surgeryController.updateSurgery);
router.delete("/:id", surgeryController.deleteSurgery);

module.exports = router;
