"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _auth = require("../../middleware/auth");
var _auth2 = require("./auth.controller");
const router = (0, _express.Router)();
const controller = new _auth2.AuthController();
router.post('/login', controller.login.bind(controller));
router.post('/register', controller.register.bind(controller));
router.get('/me', _auth.authenticate, controller.me.bind(controller));
router.post('/change-password', _auth.authenticate, controller.changePassword.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
var _default = exports.default = router;