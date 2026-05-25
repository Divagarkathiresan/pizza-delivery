const InventoryItem = require('../models/InventoryItem');
const { sendEmail } = require('./mailer');

const defaultItems = [
  { category: 'base', name: 'Classic Thin Crust', stock: 50, threshold: 20 },
  { category: 'base', name: 'Cheese Burst', stock: 50, threshold: 20 },
  { category: 'base', name: 'Pan Pizza', stock: 50, threshold: 20 },
  { category: 'base', name: 'Gluten Free', stock: 30, threshold: 15 },
  { category: 'base', name: 'Stuffed Crust', stock: 40, threshold: 20 },
  { category: 'sauce', name: 'Tomato Basil', stock: 100, threshold: 25 },
  { category: 'sauce', name: 'Barbecue', stock: 100, threshold: 25 },
  { category: 'sauce', name: 'Garlic Ranch', stock: 100, threshold: 25 },
  { category: 'sauce', name: 'Pesto', stock: 80, threshold: 20 },
  { category: 'sauce', name: 'Buffalo', stock: 80, threshold: 20 },
  { category: 'cheese', name: 'Mozzarella', stock: 120, threshold: 30 },
  { category: 'cheese', name: 'Cheddar', stock: 120, threshold: 30 },
  { category: 'cheese', name: 'Provolone', stock: 120, threshold: 30 },
  { category: 'cheese', name: 'Parmesan', stock: 100, threshold: 20 },
  { category: 'cheese', name: 'Vegan Cheese', stock: 80, threshold: 20 },
  { category: 'veggies', name: 'Onion', stock: 100, threshold: 25 },
  { category: 'veggies', name: 'Bell Pepper', stock: 100, threshold: 25 },
  { category: 'veggies', name: 'Olives', stock: 100, threshold: 25 },
  { category: 'veggies', name: 'Tomato', stock: 100, threshold: 25 },
  { category: 'veggies', name: 'Mushroom', stock: 100, threshold: 25 },
  { category: 'meats', name: 'Pepperoni', stock: 100, threshold: 25 },
  { category: 'meats', name: 'Sausage', stock: 100, threshold: 25 },
  { category: 'meats', name: 'Chicken', stock: 100, threshold: 25 },
  { category: 'meats', name: 'Bacon', stock: 100, threshold: 25 },
  { category: 'meats', name: 'Ham', stock: 100, threshold: 25 }
];

const initializeInventory = async () => {
  const count = await InventoryItem.countDocuments();
  if (count === 0) {
    await seedDefaultInventory();
  }
};

const seedDefaultInventory = async () => {
  await Promise.all(defaultItems.map(item =>
    InventoryItem.findOneAndUpdate(
      { category: item.category, name: item.name },
      { $set: item },
      { upsert: true, new: true }
    )
  ));
  console.log(`Default inventory seeded/restored: ${defaultItems.length} items.`);
};

const checkInventoryThreshold = async () => {
  try {
    const lowItems = await InventoryItem.find({
      $expr: { $lt: ['$stock', '$threshold'] },
      $or: [
        { lastNotifiedAt: { $exists: false } },
        { lastNotifiedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24) } }
      ]
    });

    if (lowItems.length === 0) return;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const lines = lowItems.map(item => `${item.category}: ${item.name} — stock ${item.stock}, threshold ${item.threshold}`);
    await sendEmail(
      adminEmail,
      'Pizza Inventory Low Stock Alert',
      `The following inventory items are below threshold:\n\n${lines.join('\n')}`,
      `<p>The following inventory items are below threshold:</p><ul>${lines.map(line => `<li>${line}</li>`).join('')}</ul>`
    );

    await InventoryItem.updateMany(
      { _id: { $in: lowItems.map(item => item._id) } },
      { lastNotifiedAt: new Date() }
    );
    console.log('Low-stock notification sent to admin.');
  } catch (error) {
    console.error('Inventory threshold check failed:', error.message);
  }
};

module.exports = { initializeInventory, seedDefaultInventory, checkInventoryThreshold };
