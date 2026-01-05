"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.telemetryLimiter = exports.apiLimiter = void 0;
var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const apiLimiter = exports.apiLimiter = (0, _expressRateLimit.default)({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false
});
const telemetryLimiter = exports.telemetryLimiter = (0, _expressRateLimit.default)({
  windowMs: 60_000,
  limit: 3_000,
  standardHeaders: true,
  legacyHeaders: false
});