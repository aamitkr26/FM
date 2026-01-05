"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorize = exports.authenticate = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _env = require("../config/env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const authenticate = (req, res, next) => {
  const header = req.header('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({
      message: 'Unauthorized'
    });
    return;
  }
  const token = header.slice('bearer '.length).trim();
  try {
    const decoded = _jsonwebtoken.default.verify(token, _env.env.auth.jwtSecret);
    const user = {
      id: String(decoded.id ?? decoded.userId ?? ''),
      email: String(decoded.email ?? ''),
      role: String(decoded.role ?? '')
    };
    if (!user.id || !user.email) {
      res.status(401).json({
        message: 'Unauthorized'
      });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({
      message: 'Unauthorized'
    });
  }
};
exports.authenticate = authenticate;
const authorize = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    res.status(401).json({
      message: 'Unauthorized'
    });
    return;
  }
  if (!roles.includes(role)) {
    res.status(403).json({
      message: 'Forbidden'
    });
    return;
  }
  next();
};
exports.authorize = authorize;