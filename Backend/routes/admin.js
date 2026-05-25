const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/inventory', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const { category, name, stock, threshold } = req.body;
    const existing = await InventoryItem.findOne({ category, name });
    if (existing) {
      existing.stock = stock ?? existing.stock;
      existing.threshold = threshold ?? existing.threshold;
      await existing.save();
      return res.json(existing);
    }
    const item = await InventoryItem.create({ category, name, stock, threshold });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    const { stock, threshold } = req.body;
    if (stock != null) item.stock = stock;
    if (threshold != null) item.threshold = threshold;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['order received', 'in the kitchen', 'sent to delivery'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
