"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.telemetryPhoneInputSchema = exports.telemetryInputSchema = exports.getTelemetrySchema = void 0;
var _zod = require("zod");
const telemetryInputSchema = exports.telemetryInputSchema = _zod.z.object({
  body: _zod.z.object({
    imei: _zod.z.string().min(1),
    timestamp: _zod.z.union([_zod.z.string(), _zod.z.coerce.date()]),
    latitude: _zod.z.coerce.number(),
    longitude: _zod.z.coerce.number(),
    speed: _zod.z.coerce.number(),
    ignition: _zod.z.coerce.boolean(),
    motion: _zod.z.coerce.boolean().optional(),
    fuelLevel: _zod.z.coerce.number().optional(),
    odometer: _zod.z.coerce.number().optional(),
    power: _zod.z.coerce.number().optional(),
    raw: _zod.z.any().optional()
  })
});
const telemetryPhoneInputSchema = exports.telemetryPhoneInputSchema = _zod.z.object({
  body: _zod.z.object({
    vehicleId: _zod.z.string().min(1).optional(),
    timestamp: _zod.z.union([_zod.z.string(), _zod.z.coerce.date()]),
    latitude: _zod.z.coerce.number(),
    longitude: _zod.z.coerce.number(),
    speed: _zod.z.coerce.number().optional().default(0),
    ignition: _zod.z.coerce.boolean().optional().default(true),
    motion: _zod.z.coerce.boolean().optional(),
    accuracy: _zod.z.coerce.number().optional(),
    raw: _zod.z.any().optional()
  })
});
const getTelemetrySchema = exports.getTelemetrySchema = _zod.z.object({
  params: _zod.z.object({
    vehicleId: _zod.z.string().min(1)
  }),
  query: _zod.z.object({
    limit: _zod.z.coerce.number().int().positive().optional(),
    startDate: _zod.z.string().optional(),
    endDate: _zod.z.string().optional()
  })
});