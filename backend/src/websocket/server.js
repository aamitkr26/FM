"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIo = getIo;
exports.initWebSocket = initWebSocket;
var _socket = require("socket.io");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _env = require("../config/env");
var _logger = require("../config/logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let io = null;
const isLocalDevOrigin = origin => {
  try {
    const u = new URL(origin);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};
function initWebSocket(server) {
  io = new _socket.Server(server, {
    cors: {
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
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }
    try {
      const decoded = _jsonwebtoken.default.verify(String(token), _env.env.auth.jwtSecret);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });
  io.on('connection', socket => {
    _logger.logger.info('WebSocket client connected', {
      id: socket.id
    });
    socket.on('disconnect', reason => {
      _logger.logger.info('WebSocket client disconnected', {
        id: socket.id,
        reason
      });
    });
  });
  return io;
}
function getIo() {
  return io;
}