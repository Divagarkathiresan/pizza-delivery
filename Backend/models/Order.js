const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  base: { type: String, required: true },
  sauce: { type: String, required: true },
  cheese: { type: String, required: true },
  veggies: [{ type: String }],
  meats: [{ type: String }],
  price: { type: Number, required: true },
  paymentProvider: { type: String, default: 'manual' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  status: { type: String, enum: ['order received', 'in the kitchen', 'sent to delivery'], default: 'order received' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
