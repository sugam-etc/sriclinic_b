const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },

    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String },
    petId: { type: String },
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
