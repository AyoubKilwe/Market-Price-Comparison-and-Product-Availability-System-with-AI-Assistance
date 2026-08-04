const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  let payload;
  try {
    payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Authentication token is invalid or expired' });
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    return res.status(401).json({ message: 'Authenticated account no longer exists' });
  }

  if (user.status === 'Suspended') {
    return res.status(403).json({ message: 'This account has been suspended' });
  }

  req.user = user;
  return next();
});

module.exports = protect;
