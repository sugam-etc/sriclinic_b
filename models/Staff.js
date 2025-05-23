const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Import bcrypt

const staffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, required: true },
    licenseNumber: String,
    qualifications: String,
    phone: { type: String, required: true },
    email: { type: String, required: true },
    joinDate: { type: Date, required: true },
    address: String,
    emergencyContact: String,
    notes: String,
    userId: { type: String, required: true, unique: true }, // Added unique constraint for userId
    password: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password before saving a new staff member or updating password
staffSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

module.exports = mongoose.model("Staff", staffSchema);
