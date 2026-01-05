"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DashboardController = void 0;
var _dashboard = require("./dashboard.service");
const service = new _dashboard.DashboardService();
class DashboardController {
  async statistics(_req, res, next) {
    try {
      const stats = await service.getStatistics();
      res.json({
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
  async alerts(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const alerts = await service.getRecentAlerts(limit);
      res.json({
        count: alerts.length,
        data: alerts
      });
    } catch (err) {
      next(err);
    }
  }
  async fuelStats(req, res, next) {
    try {
      const days = req.query.days ? parseInt(String(req.query.days), 10) : 7;
      const stats = await service.getFuelStats(days);
      res.json({
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
  async tripStats(req, res, next) {
    try {
      const days = req.query.days ? parseInt(String(req.query.days), 10) : 30;
      const stats = await service.getTripStats(days);
      res.json({
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
  async live(_req, res, next) {
    try {
      const vehicles = await service.getLive();
      res.json({
        count: vehicles.length,
        data: vehicles
      });
    } catch (err) {
      next(err);
    }
  }
}
exports.DashboardController = DashboardController;