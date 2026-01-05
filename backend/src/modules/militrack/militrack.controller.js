"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MilitrackController = void 0;
var _militrack = require("./militrack.service");
const service = new _militrack.MilitrackService();
const normalizeQuery = query => {
  const out = {};
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      out[key] = value.length > 0 ? String(value[0]) : undefined;
      continue;
    }
    if (value == null) {
      out[key] = undefined;
      continue;
    }
    out[key] = String(value);
  }
  return out;
};
class MilitrackController {
  async getDeviceInfo(req, res, next) {
    try {
      const extraQuery = normalizeQuery(req.query);
      const data = await service.getDeviceInfo(extraQuery);
      res.json({
        data
      });
    } catch (err) {
      next(err);
    }
  }
  async getDevices(req, res, next) {
    const extraQuery = normalizeQuery(req.query);
    try {
      const devices = await service.listDevices(extraQuery);
      try {
        await service.syncDevicesToDb(devices);
      } catch {}
      res.json({
        count: devices.length,
        data: devices,
        source: 'militrack'
      });
    } catch (err) {
      try {
        const stored = await service.listStoredDevices();
        res.json({
          count: stored.length,
          data: stored,
          source: 'db'
        });
      } catch {
        next(err);
      }
    }
  }
}
exports.MilitrackController = MilitrackController;