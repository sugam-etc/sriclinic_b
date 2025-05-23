const Staff = require("../models/Staff");
const bcrypt = require("bcrypt"); // Add if not imported yet
const jwt = require("jsonwebtoken"); // Add if needed for JWT

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single staff
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Staff login
exports.loginStaff = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: "Missing userId or password" });
    }

    const staff = await Staff.findOne({ userId });
    if (!staff) {
      return res.status(401).json({ message: "Invalid userId or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid userId or password" });
    }

    // Generate token if needed
    // const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Send back staff info (and token if you generate one)
    res.json({
      message: "Login successful",
      staff: {
        id: staff._id,
        userId: staff.userId,
        name: staff.name,
        // token,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
