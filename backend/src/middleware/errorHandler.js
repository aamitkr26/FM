"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notFound = exports.errorHandler = exports.AppError = void 0;
var _logger = require("../config/logger");
class AppError extends Error {
  constructor(message, statusCode, expose = true) {
    super(message);
    this.statusCode = statusCode;
    this.expose = expose;
  }
}
exports.AppError = AppError;
const notFound = (_req, res) => {
  res.status(404).json({
    message: 'Not found'
  });
};
exports.notFound = notFound;
const errorHandler = (err, _req, res, _next) => {
  const appError = err instanceof AppError ? err : null;
  const status = appError?.statusCode ?? 500;
  const message = appError?.expose === false ? 'Internal server error' : err instanceof Error ? err.message : 'Internal server error';
  if (status >= 500) {
    _logger.logger.error('Unhandled error', {
      err
    });
  }
  res.status(status).json({
    message
  });
};
exports.errorHandler = errorHandler;