const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    owner1: { type: String, required: true },
    owner2: String,
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    additionalInfo: {
      petName: String,
      species: String,
      breed: String,
      age: String,
      vaccinationStatus: String,
      notes: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
