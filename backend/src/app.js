"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createApp = createApp;
var _cors = _interopRequireDefault(require("cors"));
var _express = _interopRequireDefault(require("express"));
var _env = require("./config/env");
var _logger = require("./config/logger");
var _errorHandler = require("./middleware/errorHandler");
var _rateLimiter = require("./middleware/rateLimiter");
var _auth = _interopRequireDefault(require("./modules/auth/auth.routes"));
var _alerts = _interopRequireDefault(require("./modules/alerts/alerts.routes"));
var _dashboard = _interopRequireDefault(require("./modules/dashboard/dashboard.routes"));
var _vehicles = _interopRequireDefault(require("./modules/vehicles/vehicles.routes"));
var _telemetry = _interopRequireDefault(require("./modules/telemetry/telemetry.routes"));
var _fuel = _interopRequireDefault(require("./modules/fuel/fuel.routes"));
var _geofence = _interopRequireDefault(require("./modules/geofence/geofence.routes"));
var _trip = _interopRequireDefault(require("./modules/trip/trip.routes"));
var _militrack = _interopRequireDefault(require("./modules/militrack/militrack.routes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const isLocalDevOrigin = origin => {
  try {
    const u = new URL(origin);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};
function createApp() {
  const app = (0, _express.default)();
  app.set('trust proxy', 1);
  app.use((0, _cors.default)({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (_env.env.cors.origins.includes(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(_express.default.json({
    limit: '10mb'
  }));
  app.use((req, _res, next) => {
    _logger.logger.http(`${req.method} ${req.path}`);
    next();
  });
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: _env.env.server.nodeEnv
    });
  });
  app.use('/api', _rateLimiter.apiLimiter);
  app.use('/api/auth', _auth.default);
  app.use('/api/alerts', _alerts.default);
  app.use('/api/dashboard', _dashboard.default);
  app.use('/api/vehicles', _vehicles.default);
  app.use('/api/telemetry', _telemetry.default);
  app.use('/api/fuel', _fuel.default);
  app.use('/api/geofence', _geofence.default);
  app.use('/api/trips', _trip.default);
  app.use('/api/militrack', _militrack.default);
  app.use(_errorHandler.notFound);
  app.use(_errorHandler.errorHandler);
  return app;
}