const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
  threshold: { type: Number, default: 20 },
  lastNotifiedAt: { type: Date }
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
