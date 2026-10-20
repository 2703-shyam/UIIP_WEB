const jwt = require('jsonwebtoken');

const DEFAULT_JWT_SECRET = 'uiip-default-secret-key-2026';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
