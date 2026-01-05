"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _vehicles = require("./vehicles.controller");
const router = (0, _express.Router)();
const controller = new _vehicles.VehiclesController();
router.use(_auth.authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/statistics', controller.getStatistics.bind(controller));
router.get('/positions', controller.getPositions.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
var _default = exports.default = router;