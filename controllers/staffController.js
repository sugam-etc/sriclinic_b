const Staff = require("../models/Staff");
const bcrypt = require("bcrypt"); // Ensure bcrypt is imported here
const jwt = require("jsonwebtoken"); // Ensure jwt is imported if you plan to use it

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
// IMPORTANT: When creating new staff, ensure the password is sent in the request body.
// The pre-save hook in the Staff model will hash it automatically.
exports.createStaff = async (req, res) => {
  try {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    // Handle duplicate userId error specifically
    if (err.code === 11000 && err.keyPattern && err.keyPattern.userId) {
      return res
        .status(409)
        .json({
          error: "User ID already exists. Please choose a different one.",
        });
    }
    res.status(400).json({ error: err.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { password, ...otherUpdates } = req.body;
    let updates = otherUpdates; // If password is being updated, hash it before saving

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.password = hashedPassword;
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true, // Ensure schema validators run on update
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
    } // Generate token if needed (uncomment and configure JWT_SECRET in .env)

    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    ); // Send back staff info and token

    res.json({
      message: "Login successful",
      staff: {
        id: staff._id,
        userId: staff.userId,
        name: staff.fullName, // Assuming 'fullName' is the field for the staff's name
        role: staff.role, // Include role for client-side routing
      },
      token, // Include the token in the response
    });
  } catch (err) {
    console.error("Login error:", err); // Log the full error for debugging
    res
      .status(500)
      .json({ error: "An internal server error occurred during login." });
  }
};
