require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const { initializeInventory, checkInventoryThreshold } = require('./utils/inventory');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to MongoDB');
    await initializeInventory();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    if (adminEmail) {
      const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        await User.create({
          name: 'Admin',
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin'
        });
        console.log(`Created admin user ${adminEmail}`);
      } else if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Updated admin user ${adminEmail}`);
      }
    }
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Pizza Delivery API is running.' });
});

cron.schedule('*/5 * * * *', async () => {
  await checkInventoryThreshold();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
