const express = require("express");
const router = express.Router();

const {
  getAllVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  searchVaccinations,
} = require("../controllers/vaccinationController");

router.get("/", getAllVaccinations);
router.get("/search", searchVaccinations);
router.get("/:id", getVaccinationById);
router.post("/", createVaccination);
router.put("/:id", updateVaccination);
router.delete("/:id", deleteVaccination);

module.exports = router;
