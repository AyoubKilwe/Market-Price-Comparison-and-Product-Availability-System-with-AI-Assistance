const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const authResponse = (user) => ({
  token: createToken(user),
  user: user.toJSON(),
});

const registerVendor = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      message: 'Name, email, phone, and password are required',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      role: 'Vendor',
    });

    return res.status(201).json(authResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.status === 'Suspended') {
    return res.status(403).json({ message: 'This account has been suspended' });
  }

  return res.status(200).json(authResponse(user));
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({ user: req.user.toJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(req.body.currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (req.body.currentPassword === req.body.newPassword) {
    return res.status(400).json({ message: 'New password must be different from the current password' });
  }

  user.password = req.body.newPassword;
  await user.save();
  return res.status(200).json({ message: 'Password changed successfully' });
});

module.exports = { changePassword, getMe, login, registerVendor };
