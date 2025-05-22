const Sale = require("../models/Sale");

// GET all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a sale
exports.createSale = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE sale
exports.updateSale = async (req, res) => {
  try {
    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedSale)
      return res.status(404).json({ message: "Sale not found" });
    res.json(updatedSale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE sale
exports.deleteSale = async (req, res) => {
  try {
    const deleted = await Sale.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
