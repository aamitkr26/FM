"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthController = void 0;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _database = require("../../config/database");
var _env = require("../../config/env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class AuthController {
  async login(req, res, next) {
    try {
      const {
        email,
        password
      } = req.body;
      if (!email || !password) {
        res.status(400).json({
          message: 'Email and password are required'
        });
        return;
      }
      const user = await _database.prisma.user.findUnique({
        where: {
          email
        }
      });
      if (!user) {
        res.status(401).json({
          message: 'Invalid credentials'
        });
        return;
      }
      const ok = await _bcryptjs.default.compare(password, user.password);
      if (!ok) {
        res.status(401).json({
          message: 'Invalid credentials'
        });
        return;
      }
      const token = _jsonwebtoken.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
      }, _env.env.auth.jwtSecret, {
        expiresIn: '7d'
      });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
  async register(req, res, next) {
    try {
      const {
        email,
        password,
        name,
        role
      } = req.body;
      if (!email || !password) {
        res.status(400).json({
          message: 'Email and password are required'
        });
        return;
      }
      const hashed = await _bcryptjs.default.hash(password, 10);
      const user = await _database.prisma.user.create({
        data: {
          email,
          password: hashed,
          name: name ?? null,
          role: role ?? 'supervisor'
        }
      });
      const token = _jsonwebtoken.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
      }, _env.env.auth.jwtSecret, {
        expiresIn: '7d'
      });
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      if (err?.code === 'P2002') {
        res.status(409).json({
          message: 'Email already exists'
        });
        return;
      }
      next(err);
    }
  }
  async me(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          message: 'Unauthorized'
        });
        return;
      }
      const user = await _database.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
  async changePassword(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          message: 'Unauthorized'
        });
        return;
      }
      const {
        currentPassword,
        newPassword
      } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          message: 'Current password and new password are required'
        });
        return;
      }
      if (String(newPassword).length < 6) {
        res.status(400).json({
          message: 'New password must be at least 6 characters'
        });
        return;
      }
      const user = await _database.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      const ok = await _bcryptjs.default.compare(currentPassword, user.password);
      if (!ok) {
        res.status(401).json({
          message: 'Invalid current password'
        });
        return;
      }
      const hashed = await _bcryptjs.default.hash(newPassword, 10);
      await _database.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          password: hashed
        }
      });
      res.json({
        message: 'Password changed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
  async refresh(req, res) {
    try {
      const {
        refreshToken
      } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          data: null
        });
        return;
      }
      const decoded = _jsonwebtoken.default.verify(refreshToken, _env.env.auth.jwtSecret);
      const userId = String(decoded.id ?? decoded.userId ?? '');
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          data: null
        });
        return;
      }
      const user = await _database.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          data: null
        });
        return;
      }
      const accessToken = _jsonwebtoken.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
      }, _env.env.auth.jwtSecret, {
        expiresIn: '7d'
      });
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      });
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        data: null
      });
    }
  }
}
exports.AuthController = AuthController;