const express = require("express");
const router = express.Router();
const {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/saleController");

// GET all sales
router.get("/", getAllSales);

// GET a single sale
router.get("/:id", getSaleById);

// CREATE a sale
router.post("/", createSale);

// UPDATE a sale
router.put("/:id", updateSale);

// DELETE a sale
router.delete("/:id", deleteSale);

module.exports = router;
