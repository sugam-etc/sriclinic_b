const bcrypt = require("bcrypt");
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

// Create new staff (hash password)
exports.createStaff = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      ...rest,
      password: hashedPassword,
    });

    const savedStaff = await newStaff.save();
    res.status(201).json(savedStaff);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// Update staff by ID (optional: hash password if updating)
exports.updateStaff = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Login staff (compare password using bcrypt)
exports.loginStaff = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const staff = await Staff.findOne({ userId });

    if (!staff) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
