const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const { authenticate } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');
const { sendEmailVerification, checkEmailVerification } = require('../utils/twilioVerify');

const router = express.Router();

const normalizeEmail = email => email.trim().toLowerCase();

const createToken = (userId, type) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  return new Token({ userId, token, type, expiresAt });
};

router.post('/send-email-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    await sendEmailVerification(normalizedEmail);
    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to send verification code' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, emailCode } = req.body;
    if (!name || !email || !password || !emailCode) {
      return res.status(400).json({ message: 'Name, email, password and verification code are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const verification = await checkEmailVerification(normalizedEmail, emailCode);
    if (verification.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email: normalizedEmail, passwordHash, role: 'user' });

    res.status(201).json({ message: 'Registration complete. You can log in now.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ message: 'If the email exists, a reset link has been sent' });

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent' });

    const resetToken = createToken(user._id, 'reset');
    await resetToken.save();

    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken.token}`;
    await sendEmail(
      user.email,
      'Reset your Pizza Delivery password',
      `Reset your password by clicking the link: ${url}`,
      `<p>Click <a href="${url}">here</a> to reset your password.</p>`
    );

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = await Token.findOne({ token: req.params.token, type: 'reset' });
    if (!resetToken || resetToken.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Reset token invalid or expired' });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    await resetToken.deleteOne();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const { name, email, role } = req.user;
  res.json({ name, email, role });
});

module.exports = router;
