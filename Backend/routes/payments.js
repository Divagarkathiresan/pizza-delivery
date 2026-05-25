const crypto = require('crypto');
const express = require('express');
const Razorpay = require('razorpay');
const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const { checkInventoryThreshold } = require('../utils/inventory');

const router = express.Router();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const normalizeCartItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty');
  }

  return items.flatMap(item => {
    if (!item.base || !item.sauce || !item.cheese || !item.price) {
      throw new Error('Cart contains invalid pizza details');
    }

    const quantity = Math.max(1, Number(item.quantity || 1));
    return Array.from({ length: quantity }, () => ({
      base: item.base,
      sauce: item.sauce,
      cheese: item.cheese,
      veggies: Array.isArray(item.veggies) ? item.veggies : [],
      meats: Array.isArray(item.meats) ? item.meats : [],
      price: Number(item.price)
    }));
  });
};

const calculateTotal = items => items.reduce((sum, item) => sum + item.price, 0);

const createPaidOrders = async (user, items, payment) => {
  const selections = items.flatMap(item => [
    { category: 'base', name: item.base, count: 1 },
    { category: 'sauce', name: item.sauce, count: 1 },
    { category: 'cheese', name: item.cheese, count: 1 },
    ...item.veggies.map(name => ({ category: 'veggies', name, count: 1 })),
    ...item.meats.map(name => ({ category: 'meats', name, count: 1 }))
  ]);

  const requiredItems = Array.from(
    selections.reduce((map, selection) => {
      const key = `${selection.category}:${selection.name}`;
      const existing = map.get(key) || { ...selection, count: 0 };
      existing.count += selection.count;
      map.set(key, existing);
      return map;
    }, new Map()).values()
  );

  const decrementedItems = [];

  try {
    for (const selection of requiredItems) {
      const inventory = await InventoryItem.findOneAndUpdate(
        { category: selection.category, name: selection.name, stock: { $gte: selection.count } },
        { $inc: { stock: -selection.count } },
        { new: true }
      );

      if (!inventory) {
        throw new Error(`Insufficient stock for ${selection.category} - ${selection.name}`);
      }

      decrementedItems.push(selection);
    }

    const orders = await Order.insertMany(items.map(item => ({
        user: user._id,
        userName: user.name,
        userEmail: user.email,
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        veggies: item.veggies,
        meats: item.meats,
        price: item.price,
        paymentProvider: 'razorpay',
        paymentId: payment.paymentId,
        razorpayOrderId: payment.orderId
    })));

    checkInventoryThreshold().catch(error => {
      console.error('Inventory threshold check failed:', error.message);
    });

    return orders;
  } catch (error) {
    await Promise.all(decrementedItems.map(decremented =>
      InventoryItem.updateOne(
        { category: decremented.category, name: decremented.name },
        { $inc: { stock: decremented.count } }
      )
    ));
    throw error;
  }
};

router.post('/create-order', authenticate, async (req, res) => {
  try {
    const items = normalizeCartItems(req.body.items);
    const amount = calculateTotal(items);
    if (amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `pizza_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email
      }
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      order: razorpayOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create Razorpay order' });
  }
});

router.post('/verify', authenticate, async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      items: rawItems
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const items = normalizeCartItems(rawItems);
    const amount = calculateTotal(items);
    const razorpayOrder = await getRazorpay().orders.fetch(razorpayOrderId);

    if (razorpayOrder.amount !== Math.round(amount * 100)) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    const orders = await createPaidOrders(req.user, items, {
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId
    });

    res.status(201).json({
      message: 'Payment verified and order placed successfully',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
});

module.exports = router;
