const express = require('express');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const { authenticate } = require('../middleware/auth');
const { checkInventoryThreshold } = require('../utils/inventory');

const router = express.Router();

router.get('/menu', async (req, res) => {
  try {
    const items = await InventoryItem.find();
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { base, sauce, cheese, veggies = [], meats = [], price } = req.body;
    if (!base || !sauce || !cheese || !price) return res.status(400).json({ message: 'Missing order details' });

    const selections = [
      { category: 'base', name: base, count: 1 },
      { category: 'sauce', name: sauce, count: 1 },
      { category: 'cheese', name: cheese, count: 1 }
    ];
    veggies.forEach(name => selections.push({ category: 'veggies', name, count: 1 }));
    meats.forEach(name => selections.push({ category: 'meats', name, count: 1 }));

    const decrementedItems = [];

    for (const item of selections) {
      const inventory = await InventoryItem.findOneAndUpdate(
        { category: item.category, name: item.name, stock: { $gte: item.count } },
        { $inc: { stock: -item.count } },
        { new: true }
      );
      if (!inventory) {
        await Promise.all(decrementedItems.map(decremented =>
          InventoryItem.updateOne(
            { category: decremented.category, name: decremented.name },
            { $inc: { stock: decremented.count } }
          )
        ));
        return res.status(400).json({ message: `Insufficient stock for ${item.category} - ${item.name}` });
      }
      decrementedItems.push(item);
    }

    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        base,
        sauce,
        cheese,
        veggies,
        meats,
        price
      });
    } catch (error) {
      await Promise.all(decrementedItems.map(decremented =>
        InventoryItem.updateOne(
          { category: decremented.category, name: decremented.name },
          { $inc: { stock: decremented.count } }
        )
      ));
      throw error;
    }

    checkInventoryThreshold().catch(error => {
      console.error('Inventory threshold check failed:', error.message);
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
