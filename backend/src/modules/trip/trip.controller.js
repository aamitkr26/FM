"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TripController = void 0;
var _trip = require("./trip.service");
const service = new _trip.TripService();
class TripController {
  async getAll(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const trips = await service.getAll({
        limit,
        status
      });
      res.json({
        count: trips.length,
        data: trips
      });
    } catch (err) {
      next(err);
    }
  }
  async getByVehicle(req, res, next) {
    try {
      const vehicleId = String(req.params.vehicleId);
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const trips = await service.getByVehicle(vehicleId, {
        limit,
        status
      });
      res.json({
        count: trips.length,
        data: trips
      });
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const id = String(req.params.id);
      const trip = await service.getById(id);
      if (!trip) {
        res.status(404).json({
          message: 'Trip not found'
        });
        return;
      }
      res.json({
        data: trip
      });
    } catch (err) {
      next(err);
    }
  }
}
exports.TripController = TripController;