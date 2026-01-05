"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _geofence = require("./geofence.controller");
const router = (0, _express.Router)();
const controller = new _geofence.GeofenceController();
router.use(_auth.authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/alerts', controller.getAlerts.bind(controller));
router.get('/alerts/all', controller.getAlerts.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', (0, _auth.authorize)('owner', 'supervisor', 'admin'), controller.create.bind(controller));
router.patch('/:id', (0, _auth.authorize)('owner', 'supervisor', 'admin'), controller.update.bind(controller));
router.delete('/:id', (0, _auth.authorize)('owner', 'supervisor', 'admin'), controller.delete.bind(controller));
var _default = exports.default = router;