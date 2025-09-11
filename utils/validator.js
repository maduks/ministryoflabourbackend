const { body, validationResult } = require('express-validator');

const validateUserSignUp = [
  body('name').isString().withMessage('Name must be a String'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
    validateUserSignUp,
};