"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _alerts = require("./alerts.controller");
const router = (0, _express.Router)();
const controller = new _alerts.AlertsController();
router.use(_auth.authenticate);
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.patch('/:id/resolve', controller.resolve.bind(controller));
router.post('/:id/resolve', controller.resolve.bind(controller));
router.patch('/:id/unresolve', controller.unresolve.bind(controller));
router.post('/:id/unresolve', controller.unresolve.bind(controller));
var _default = exports.default = router;