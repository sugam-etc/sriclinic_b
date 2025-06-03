const InventoryItem = require("../models/InventoryItem");
const Supplier = require("../models/Supplier");

exports.getAllInventoryItems = async (req, res) => {
  try {
    // Populate the supplier field to get full supplier details
    const items = await InventoryItem.find().populate("supplier");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      type,
      unitName,
      location,
      quantity,
      price,
      costPrice,
      sellingPrice,
      manufacturer,
      supplier: supplierData, // Renamed to avoid conflict with model 'Supplier'
      batchNumber,
      expiryDate,
      lastUpdated,
      threshold,
      description,
    } = req.body;

    // 1. Find or create supplier by name
    let existingSupplier = await Supplier.findOne({ name: supplierData.name });

    if (!existingSupplier) {
      // If supplier doesn't exist, create it with provided data
      existingSupplier = new Supplier({
        name: supplierData.name,
        company: supplierData.company || "N/A",
        PAN: supplierData.PAN || "N/A",
        phone: supplierData.phone || "",
        email: supplierData.email || "",
        address: supplierData.address || "",
      });
      await existingSupplier.save();
    } else {
      // If supplier exists, update its details (optional, but good for consistency)
      Object.assign(existingSupplier, {
        company: supplierData.company || existingSupplier.company,
        PAN: supplierData.PAN || existingSupplier.PAN,
        phone: supplierData.phone || existingSupplier.phone,
        email: supplierData.email || existingSupplier.email,
        address: supplierData.address || existingSupplier.address,
      });
      await existingSupplier.save();
    }

    // 2. Create inventory item linked to supplier by its _id
    const inventoryItem = new InventoryItem({
      name,
      type,
      unitName,
      location,
      quantity,
      price,
      costPrice,
      sellingPrice,
      manufacturer,
      supplier: existingSupplier._id, // Store the ObjectId of the supplier
      batchNumber,
      expiryDate,
      lastUpdated,
      threshold,
      description,
    });

    await inventoryItem.save();

    // 3. Push new inventory item's _id to supplier's supplyHistory array
    existingSupplier.supplyHistory.push(inventoryItem._id);
    await existingSupplier.save();

    // Re-populate the supplier field for the response to send back full supplier details
    await inventoryItem.populate("supplier");

    res.status(201).json({ inventoryItem, supplier: existingSupplier });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier: supplierData, ...updateData } = req.body; // Extract supplier object and rest of data

    let supplierIdToSet = null;

    // If a supplier object is provided, handle it
    if (supplierData && typeof supplierData === "object" && supplierData.name) {
      let existingSupplier = await Supplier.findOne({
        name: supplierData.name,
      });

      if (!existingSupplier) {
        // Create new supplier if not found
        existingSupplier = new Supplier({
          name: supplierData.name,
          company: supplierData.company || "N/A",
          PAN: supplierData.PAN || "N/A",
          phone: supplierData.phone || "",
          email: supplierData.email || "",
          address: supplierData.address || "",
        });
        await existingSupplier.save();
      } else {
        // Update existing supplier details if provided
        Object.assign(existingSupplier, {
          company: supplierData.company || existingSupplier.company,
          PAN: supplierData.PAN || existingSupplier.PAN,
          phone: supplierData.phone || existingSupplier.phone,
          email: supplierData.email || existingSupplier.email,
          address: supplierData.address || existingSupplier.address,
        });
        await existingSupplier.save();
      }
      supplierIdToSet = existingSupplier._id; // Use the _id from the (updated) supplier document
    } else if (updateData.supplier) {
      // If supplier is provided as a string (an ID), use it directly
      supplierIdToSet = updateData.supplier;
    }

    // Find the item to get its current supplier before updating
    const oldItem = await InventoryItem.findById(id);

    // Update the inventory item, ensuring 'supplier' field is an ObjectId
    const item = await InventoryItem.findByIdAndUpdate(
      id,
      { ...updateData, supplier: supplierIdToSet }, // Ensure supplier is an ObjectId here
      { new: true, runValidators: true } // runValidators is important for schema validation
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Handle supplyHistory updates if supplier changed
    if (
      oldItem &&
      oldItem.supplier &&
      !oldItem.supplier.equals(item.supplier)
    ) {
      // Remove item from old supplier's history
      const oldSupplier = await Supplier.findById(oldItem.supplier);
      if (oldSupplier) {
        oldSupplier.supplyHistory = oldSupplier.supplyHistory.filter(
          (itemId) => !itemId.equals(item._id)
        );
        await oldSupplier.save();
      }

      // Add item to new supplier's history
      const newSupplier = await Supplier.findById(item.supplier);
      if (newSupplier && !newSupplier.supplyHistory.includes(item._id)) {
        newSupplier.supplyHistory.push(item._id);
        await newSupplier.save();
      }
    } else if (
      item &&
      item.supplier &&
      oldItem &&
      !oldItem.supplier &&
      supplierIdToSet
    ) {
      // Case where an item previously had no supplier, now gets one
      const newSupplier = await Supplier.findById(item.supplier);
      if (newSupplier && !newSupplier.supplyHistory.includes(item._id)) {
        newSupplier.supplyHistory.push(item._id);
        await newSupplier.save();
      }
    }

    // Re-populate the supplier field for the response
    await item.populate("supplier");

    res.json(item);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Remove item from supplier's supplyHistory
    if (item.supplier) {
      const supplier = await Supplier.findById(item.supplier);
      if (supplier) {
        supplier.supplyHistory = supplier.supplyHistory.filter(
          (itemId) => !itemId.equals(item._id)
        );
        await supplier.save();
      }
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
