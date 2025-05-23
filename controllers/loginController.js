const Staff = require("../models/Staff");

// Get all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const staffs = await Staff.find();
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a single staff member by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// Update staff by ID
exports.updateStaff = async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStaff)
      return res.status(404).json({ message: "Staff not found" });
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete staff by ID
exports.deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff)
      return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

// Login staff (basic login without hashing)
exports.loginStaff = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const staff = await Staff.findOne({ userId, password });

    if (!staff) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Ideally use token-based authentication instead of returning full record
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
