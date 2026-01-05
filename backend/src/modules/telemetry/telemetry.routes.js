"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _rateLimiter = require("../../middleware/rateLimiter");
var _validator = require("../../middleware/validator");
var _telemetry = require("./telemetry.controller");
var _telemetry2 = require("./telemetry.types");
const router = (0, _express.Router)();
const controller = new _telemetry.TelemetryController();
router.post('/', _rateLimiter.telemetryLimiter, _auth.authenticate, (0, _validator.validate)(_telemetry2.telemetryInputSchema), controller.ingest.bind(controller));
router.post('/phone', _rateLimiter.telemetryLimiter, _auth.authenticate, (0, _validator.validate)(_telemetry2.telemetryPhoneInputSchema), controller.ingestPhone.bind(controller));
router.get('/latest/all', _auth.authenticate, controller.getAllLatestTelemetry.bind(controller));

// Legacy aliases used by older clients
router.get('/vehicle/:vehicleId', _auth.authenticate, (0, _validator.validate)(_telemetry2.getTelemetrySchema), controller.getTelemetryByVehicle.bind(controller));
router.get('/vehicle/:vehicleId/latest', _auth.authenticate, controller.getLatestTelemetry.bind(controller));
router.get('/:vehicleId/latest', _auth.authenticate, controller.getLatestTelemetry.bind(controller));
router.get('/:vehicleId', _auth.authenticate, (0, _validator.validate)(_telemetry2.getTelemetrySchema), controller.getTelemetryByVehicle.bind(controller));
var _default = exports.default = router;