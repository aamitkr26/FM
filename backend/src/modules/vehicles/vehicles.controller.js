"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VehiclesController = void 0;
var _vehicles = require("./vehicles.service");
const service = new _vehicles.VehiclesService();
class VehiclesController {
  async getAll(req, res, next) {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : undefined;
      const vehicles = await service.getAll({
        status,
        limit,
        offset
      });
      res.json({
        count: vehicles.length,
        data: vehicles
      });
    } catch (err) {
      next(err);
    }
  }
  async getStatistics(_req, res, next) {
    try {
      const stats = await service.getStatistics();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
  async getPositions(_req, res, next) {
    try {
      const positions = await service.getPositions();
      res.json({
        count: positions.length,
        data: positions
      });
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.getById(id);
      if (!vehicle) {
        res.status(404).json({
          message: 'Vehicle not found'
        });
        return;
      }
      res.json({
        data: vehicle
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      const vehicle = await service.create(req.body);
      res.status(201).json({
        data: vehicle
      });
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.update(id, req.body);
      res.json({
        data: vehicle
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        res.status(404).json({
          message: 'Vehicle not found'
        });
        return;
      }
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const id = String(req.params.id);
      const vehicle = await service.delete(id);
      res.json({
        data: vehicle
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        res.status(404).json({
          message: 'Vehicle not found'
        });
        return;
      }
      next(err);
    }
  }
}
exports.VehiclesController = VehiclesController;