"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _dashboard = require("./dashboard.controller");
const router = (0, _express.Router)();
const controller = new _dashboard.DashboardController();
router.use(_auth.authenticate);
router.get('/statistics', controller.statistics.bind(controller));
router.get('/alerts', controller.alerts.bind(controller));
router.get('/live', controller.live.bind(controller));
router.get('/fuel-stats', controller.fuelStats.bind(controller));
router.get('/trip-stats', controller.tripStats.bind(controller));
var _default = exports.default = router;