const Medicine = require("../models/Medicine");
const InventoryItem = require("../models/InventoryItem");

exports.getAllMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find();
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const med = new Medicine(req.body);
    await med.save();

    // Also create in inventory
    const inventoryItem = new InventoryItem({
      ...req.body,
      name: req.body.name,
      type: "Medicine",
      quantity: req.body.unit, // assuming unit is total quantity
      price: req.body.sellingPrice,
    });
    await inventoryItem.save();

    res.status(201).json(med);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    // Also update in inventory
    await InventoryItem.findOneAndUpdate(
      { name: med.name, type: "Medicine" },
      {
        ...req.body,
        price: req.body.sellingPrice,
        quantity: req.body.unit,
      }
    );

    res.json(med);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndDelete(req.params.id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    // Also delete from inventory
    await InventoryItem.findOneAndDelete({ name: med.name, type: "Medicine" });

    res.json({ message: "Medicine deleted and removed from inventory" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
