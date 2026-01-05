"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _trip = require("./trip.controller");
const router = (0, _express.Router)();
const controller = new _trip.TripController();
router.use(_auth.authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/vehicle/:vehicleId', controller.getByVehicle.bind(controller));
router.get('/:id', controller.getById.bind(controller));
var _default = exports.default = router;