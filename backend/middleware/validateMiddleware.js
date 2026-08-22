const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    return res.status(400).json({
      message: validationErrors[0]?.msg || 'Please check the information you entered and try again.',
      errors: validationErrors.map(({ path, msg, value }) => ({ field: path, message: msg, value })),
    });
  }

  return next();
};

module.exports = validate;
