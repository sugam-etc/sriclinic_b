const InventoryItem = require("../models/InventoryItem");
const Supplier = require("../models/Supplier"); // Ensure Supplier model is imported

exports.getAllInventoryItems = async (req, res) => {
  try {
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
      // Only update if the incoming supplierData has a value, otherwise retain existing
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
    // Ensure supplyHistory exists on the Supplier model
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

    // If a supplier object is provided in the request body, handle it
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
        // Update existing supplier details if provided in the request
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
    if (!oldItem) return res.status(404).json({ message: "Item not found" });

    // Construct the final update object
    const finalUpdate = { ...updateData };
    if (supplierIdToSet) {
      // If a new supplier ID was determined from the request, use it
      finalUpdate.supplier = supplierIdToSet;
    } else if (oldItem.supplier) {
      // If no new supplier is provided in the request, but the item already has one,
      // explicitly keep the old supplier to satisfy the 'required' constraint.
      finalUpdate.supplier = oldItem.supplier;
    }
    // If oldItem.supplier was null/undefined and no new supplier provided,
    // finalUpdate.supplier will remain undefined, which will cause a validation error
    // if the schema has 'required: true' and no default. This is intended behavior
    // for a required field if it's truly not being provided for a new item or an update.

    // Update the inventory item
    const item = await InventoryItem.findByIdAndUpdate(
      id,
      finalUpdate, // Use the carefully constructed finalUpdate object
      { new: true, runValidators: true } // runValidators is important for schema validation
    );

    if (!item)
      return res.status(404).json({ message: "Item not found after update" });

    // Handle supplyHistory updates if supplier changed
    if (
      oldItem &&
      oldItem.supplier && // Check if oldItem had a supplier
      item.supplier && // Check if item now has a supplier
      !oldItem.supplier.equals(item.supplier) // Check if supplier actually changed
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
      // Only add if newSupplier exists and the item is not already in its history
      if (
        newSupplier &&
        !newSupplier.supplyHistory.some((itemId) => itemId.equals(item._id))
      ) {
        newSupplier.supplyHistory.push(item._id);
        await newSupplier.save();
      }
    } else if (
      item &&
      item.supplier &&
      oldItem &&
      !oldItem.supplier // Case where an item previously had no supplier, now gets one
    ) {
      const newSupplier = await Supplier.findById(item.supplier);
      if (
        newSupplier &&
        !newSupplier.supplyHistory.some((itemId) => itemId.equals(item._id))
      ) {
        newSupplier.supplyHistory.push(item._id);
        await newSupplier.save();
      }
    }

    // Re-populate the supplier field for the response
    await item.populate("supplier");

    res.json(item);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    // Mongoose validation errors often have a 'name' property like 'ValidationError'
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: error.message, errors: error.errors });
    }
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
