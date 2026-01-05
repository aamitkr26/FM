"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _militrack = require("./militrack.controller");
const router = (0, _express.Router)();
const controller = new _militrack.MilitrackController();
router.use(_auth.authenticate);
router.get('/device-info', controller.getDeviceInfo.bind(controller));
router.get('/devices', controller.getDevices.bind(controller));
var _default = exports.default = router;