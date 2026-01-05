"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = void 0;
var _winston = _interopRequireDefault(require("winston"));
var _env = require("./env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const level = _env.env.logger.level ?? (_env.env.server.nodeEnv === 'production' ? 'info' : 'debug');
const logger = exports.logger = _winston.default.createLogger({
  level,
  format: _winston.default.format.combine(_winston.default.format.timestamp(), _winston.default.format.json()),
  transports: [new _winston.default.transports.Console()]
});