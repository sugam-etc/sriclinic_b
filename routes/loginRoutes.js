const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

// Login
router.post("/login", loginController.loginStaff);

// CRUD
router.get("/", loginController.getAllStaff);
router.get("/:id", loginController.getStaffById);
router.post("/", loginController.createStaff);
router.put("/:id", loginController.updateStaff);
router.delete("/:id", loginController.deleteStaff);

module.exports = router;
