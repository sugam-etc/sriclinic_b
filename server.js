const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const path = require("path");

// Load environment variables
dotenv.config();

// Import route files
const inventoryRoutes = require("./routes/inventoryRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const clientRoutes = require("./routes/clientRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const patientRoutes = require("./routes/patientRoutes");
const saleRoutes = require("./routes/saleRoutes");
const staffRoutes = require("./routes/staffRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes.js");
const bloodReportRoutes = require("./routes/bloodReportRoutes");
const surgeryRoutes = require("./routes/surgeryRoutes");

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/blood-reports", bloodReportRoutes);
app.use("/api/surgeries", surgeryRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
