const BloodReport = require("../models/BloodReport");
const Patient = require("../models/Patient");
exports.getAllBloodReports = async (req, res) => {
  try {
    const reports = await BloodReport.find()
      .populate({
        path: "patient",
        populate: {
          path: "client",
          model: "Client",
        },
      })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("Error in getAllBloodReports:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBloodReportById = async (req, res) => {
  try {
    const report = await BloodReport.findById(req.params.id).populate({
      path: "patient",
      populate: {
        path: "client",
        model: "Client",
      },
    });

    if (!report)
      return res.status(404).json({ message: "Blood report not found" });
    res.json(report);
  } catch (error) {
    console.error("Error in getBloodReportById:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBloodReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await BloodReport.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate({
        path: "patient",
        populate: {
          path: "client",
          model: "Client",
        },
      });
    res.json(reports);
  } catch (error) {
    console.error("Error in getBloodReportsByPatient:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.createBloodReport = async (req, res) => {
  try {
    console.log("Backend received data for createBloodReport:", req.body);

    if (!req.body.patient) {
      return res.status(400).json({ message: "Patient reference is required" });
    }

    const patient = await Patient.findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Explicitly process required fields to ensure correct types and trim strings
    const processedBody = {
      ...req.body,
      veterinarian: req.body.veterinarian
        ? String(req.body.veterinarian).trim()
        : "",
      sampleCollectedDate: req.body.sampleCollectedDate
        ? new Date(req.body.sampleCollectedDate)
        : null,
      sampleTestedDate: req.body.sampleTestedDate
        ? new Date(req.body.sampleTestedDate)
        : null,
    };

    // Ensure date fields are not invalid dates if parsing failed
    if (
      processedBody.sampleCollectedDate &&
      isNaN(processedBody.sampleCollectedDate.getTime())
    ) {
      processedBody.sampleCollectedDate = null;
    }
    if (
      processedBody.sampleTestedDate &&
      isNaN(processedBody.sampleTestedDate.getTime())
    ) {
      processedBody.sampleTestedDate = null;
    }

    // Re-check required fields after processing
    if (!processedBody.veterinarian) {
      return res.status(400).json({ message: "Veterinarian name is required" });
    }
    if (!processedBody.sampleCollectedDate) {
      return res
        .status(400)
        .json({ message: "Sample Collected Date is required" });
    }
    if (!processedBody.sampleTestedDate) {
      return res
        .status(400)
        .json({ message: "Sample Tested Date is required" });
    }

    const bloodReport = new BloodReport(processedBody);
    await bloodReport.save();

    await Patient.findByIdAndUpdate(req.body.patient, {
      $push: { bloodReports: bloodReport._id },
    });

    res.status(201).json(bloodReport);
  } catch (error) {
    console.error("Error creating blood report:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateBloodReport = async (req, res) => {
  try {
    console.log("Backend received data for updateBloodReport:", req.body);

    const existingReport = await BloodReport.findById(req.params.id);
    if (!existingReport) {
      return res.status(404).json({ message: "Blood report not found" });
    }

    if (
      req.body.patient &&
      req.body.patient !== existingReport.patient.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Cannot change patient reference" });
    }

    // Explicitly process required fields for update as well
    const processedBody = {
      ...req.body,
      veterinarian: req.body.veterinarian
        ? String(req.body.veterinarian).trim()
        : existingReport.veterinarian,
      sampleCollectedDate: req.body.sampleCollectedDate
        ? new Date(req.body.sampleCollectedDate)
        : existingReport.sampleCollectedDate,
      sampleTestedDate: req.body.sampleTestedDate
        ? new Date(req.body.sampleTestedDate)
        : existingReport.sampleTestedDate,
    };

    // Ensure date fields are not invalid dates if parsing failed
    if (
      processedBody.sampleCollectedDate &&
      isNaN(processedBody.sampleCollectedDate.getTime())
    ) {
      processedBody.sampleCollectedDate = existingReport.sampleCollectedDate;
    }
    if (
      processedBody.sampleTestedDate &&
      isNaN(processedBody.sampleTestedDate.getTime())
    ) {
      processedBody.sampleTestedDate = existingReport.sampleTestedDate;
    }

    // Re-check required fields after processing for update
    if (!processedBody.veterinarian) {
      return res.status(400).json({ message: "Veterinarian name is required" });
    }
    if (!processedBody.sampleCollectedDate) {
      return res
        .status(400)
        .json({ message: "Sample Collected Date is required" });
    }
    if (!processedBody.sampleTestedDate) {
      return res
        .status(400)
        .json({ message: "Sample Tested Date is required" });
    }

    const bloodReport = await BloodReport.findByIdAndUpdate(
      req.params.id,
      processedBody, // Use processedBody here
      { new: true, runValidators: true }
    ).populate("patient");

    res.json(bloodReport);
  } catch (error) {
    console.error("Error updating blood report:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBloodReport = async (req, res) => {
  try {
    const report = await BloodReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Blood report not found" });
    }
    res.json({ message: "Blood report deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBloodReport:", error);
    res.status(500).json({ message: error.message });
  }
};

// exports.getBloodReportsByPatient = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const reports = await BloodReport.find({ patient: patientId })
//       .sort({ createdAt: -1 })
//       .populate("patient");
//     res.json(reports);
//   } catch (error) {
//     console.error("Error in getBloodReportsByPatient:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
