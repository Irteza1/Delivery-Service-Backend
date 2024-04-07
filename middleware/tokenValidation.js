const jwt = require('jsonwebtoken');

// Middleware to validate the token
exports.validateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token found, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'kesia');
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};