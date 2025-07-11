const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Patient = require("../models/Patient");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: async function (req, file, cb) {
//     try {
//       const patient = await Patient.findById(
//         req.body.patientId || req.body.petId
//       );
//       const patientName = patient
//         ? patient.name.replace(/\s+/g, "_")
//         : "unknown";
//       const fileType = file.fieldname.replace("Files", "").replace("Forms", "");
//       const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
//       const ext = path.extname(file.originalname);

//       const filename = `${patientName}_${fileType}_${dateStr}_${Date.now()}${ext}`;
//       cb(null, filename);
//     } catch (err) {
//       cb(err);
//     }
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: async function (req, file, cb) {
    try {
      let patient;
      if (req.params.id) {
        patient = await Patient.findById(req.params.id);
      } else if (req.body.patientId || req.body.petId) {
        patient = await Patient.findById(req.body.patientId || req.body.petId);
      }

      const patientName = patient
        ? patient.name.replace(/\s+/g, "_")
        : "unknown";
      const fileType = file.fieldname
        .replace("Files", "")
        .replace("Forms", "")
        .replace("attachment", "doc");
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const ext = path.extname(file.originalname);

      const filename = `${patientName}_${fileType}_${dateStr}_${Date.now()}${ext}`;
      cb(null, filename);
    } catch (err) {
      cb(err);
    }
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 10MB limit per file
  },
});

module.exports = upload;
