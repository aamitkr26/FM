"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _fuel = require("./fuel.controller");
const router = (0, _express.Router)();
const controller = new _fuel.FuelController();
router.use(_auth.authenticate);
router.get('/events', controller.getEvents.bind(controller));
router.get('/theft', controller.getTheft.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));
router.get('/vehicle/:vehicleId', controller.getByVehicle.bind(controller));
var _default = exports.default = router;