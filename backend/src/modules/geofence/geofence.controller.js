"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GeofenceController = void 0;
var _zod = require("zod");
var _errorHandler = require("../../middleware/errorHandler");
var _geofence = require("./geofence.service");
const service = new _geofence.GeofenceService();
const polygonSchema = _zod.z.array(_zod.z.array(_zod.z.number()).length(2)).min(3, 'Polygon must have at least 3 points');
const geofenceCreateSchema = _zod.z.object({
  name: _zod.z.string().min(1, 'Name is required'),
  description: _zod.z.string().nullable().optional(),
  type: _zod.z.enum(['circle', 'polygon']),
  centerLat: _zod.z.number().nullable().optional(),
  centerLng: _zod.z.number().nullable().optional(),
  radius: _zod.z.number().nullable().optional(),
  polygon: _zod.z.unknown().nullable().optional(),
  active: _zod.z.boolean().optional(),
  expectedArrivalTime: _zod.z.union([_zod.z.string(), _zod.z.date()]).nullable().optional()
}).strict();
const geofenceUpdateSchema = _zod.z.object({
  name: _zod.z.string().min(1).optional(),
  description: _zod.z.string().nullable().optional(),
  type: _zod.z.enum(['circle', 'polygon']).optional(),
  centerLat: _zod.z.number().nullable().optional(),
  centerLng: _zod.z.number().nullable().optional(),
  radius: _zod.z.number().nullable().optional(),
  polygon: _zod.z.unknown().nullable().optional(),
  active: _zod.z.boolean().optional(),
  expectedArrivalTime: _zod.z.union([_zod.z.string(), _zod.z.date()]).nullable().optional()
}).strict();
function coerceDate(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      throw new _errorHandler.AppError('Invalid expectedArrivalTime', 400);
    }
    return d;
  }
  throw new _errorHandler.AppError('Invalid expectedArrivalTime', 400);
}
function normalizePolygon(value) {
  return polygonSchema.parse(value);
}
function isPrismaUniqueConstraintError(err) {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002';
}
function isPrismaNotFoundError(err) {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025';
}
class GeofenceController {
  async getAll(_req, res, next) {
    try {
      const geofences = await service.getAll();
      res.json({
        count: geofences.length,
        data: geofences
      });
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const id = String(req.params.id);
      const geofence = await service.getById(id);
      if (!geofence) {
        res.status(404).json({
          message: 'Geofence not found'
        });
        return;
      }
      res.json({
        data: geofence
      });
    } catch (err) {
      next(err);
    }
  }
  async create(req, res, next) {
    try {
      const input = geofenceCreateSchema.parse(req.body);
      const expectedArrivalTime = coerceDate(input.expectedArrivalTime);
      if (input.type === 'circle') {
        if (typeof input.centerLat !== 'number' || typeof input.centerLng !== 'number') {
          throw new _errorHandler.AppError('centerLat and centerLng are required for circle geofence', 400);
        }
        if (typeof input.radius !== 'number' || input.radius <= 0) {
          throw new _errorHandler.AppError('radius must be a positive number for circle geofence', 400);
        }
        const geofence = await service.create({
          name: input.name,
          description: input.description ?? null,
          type: 'circle',
          centerLat: input.centerLat,
          centerLng: input.centerLng,
          radius: input.radius,
          polygon: null,
          active: input.active ?? true,
          expectedArrivalTime: expectedArrivalTime ?? null
        });
        res.status(201).json({
          data: geofence
        });
        return;
      }
      const polygon = normalizePolygon(input.polygon);
      const geofence = await service.create({
        name: input.name,
        description: input.description ?? null,
        type: 'polygon',
        centerLat: null,
        centerLng: null,
        radius: null,
        polygon,
        active: input.active ?? true,
        expectedArrivalTime: expectedArrivalTime ?? null
      });
      res.status(201).json({
        data: geofence
      });
    } catch (err) {
      if (isPrismaUniqueConstraintError(err)) {
        next(new _errorHandler.AppError('A geofence with this name already exists', 409));
        return;
      }
      if (err instanceof _zod.z.ZodError) {
        next(new _errorHandler.AppError(err.issues[0]?.message || 'Invalid geofence payload', 400));
        return;
      }
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      const id = String(req.params.id);
      const existing = await service.getById(id);
      if (!existing) {
        res.status(404).json({
          message: 'Geofence not found'
        });
        return;
      }
      const patch = geofenceUpdateSchema.parse(req.body);
      const nextType = patch.type ?? existing.type;
      const expectedArrivalTime = coerceDate(patch.expectedArrivalTime);
      const finalCenterLat = patch.centerLat ?? existing.centerLat;
      const finalCenterLng = patch.centerLng ?? existing.centerLng;
      const finalRadius = patch.radius ?? existing.radius;
      const finalPolygon = patch.polygon !== undefined ? patch.polygon : existing.polygon;
      if (nextType === 'circle') {
        if (finalPolygon !== null && patch.polygon !== undefined) {
          throw new _errorHandler.AppError('polygon is not valid for circle geofence', 400);
        }
        if (typeof finalCenterLat !== 'number' || typeof finalCenterLng !== 'number') {
          throw new _errorHandler.AppError('centerLat and centerLng are required for circle geofence', 400);
        }
        if (typeof finalRadius !== 'number' || finalRadius <= 0) {
          throw new _errorHandler.AppError('radius must be a positive number for circle geofence', 400);
        }
        const geofence = await service.update(id, {
          ...patch,
          type: 'circle',
          centerLat: finalCenterLat,
          centerLng: finalCenterLng,
          radius: finalRadius,
          polygon: null,
          expectedArrivalTime: expectedArrivalTime ?? (patch.expectedArrivalTime === undefined ? undefined : null)
        });
        res.json({
          data: geofence
        });
        return;
      }
      const polygon = normalizePolygon(finalPolygon);
      const geofence = await service.update(id, {
        ...patch,
        type: 'polygon',
        centerLat: null,
        centerLng: null,
        radius: null,
        polygon,
        expectedArrivalTime: expectedArrivalTime ?? (patch.expectedArrivalTime === undefined ? undefined : null)
      });
      res.json({
        data: geofence
      });
    } catch (err) {
      if (isPrismaUniqueConstraintError(err)) {
        next(new _errorHandler.AppError('A geofence with this name already exists', 409));
        return;
      }
      if (err instanceof _zod.z.ZodError) {
        next(new _errorHandler.AppError(err.issues[0]?.message || 'Invalid geofence payload', 400));
        return;
      }
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      const id = String(req.params.id);
      const geofence = await service.delete(id);
      res.json({
        data: geofence
      });
    } catch (err) {
      if (isPrismaNotFoundError(err)) {
        res.status(404).json({
          message: 'Geofence not found'
        });
        return;
      }
      next(err);
    }
  }
  async getAlerts(req, res, next) {
    try {
      const vehicleId = req.query.vehicleId ? String(req.query.vehicleId) : undefined;
      const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      const alerts = await service.getAlerts({
        vehicleId,
        resolved,
        limit
      });
      res.json({
        count: alerts.length,
        data: alerts
      });
    } catch (err) {
      next(err);
    }
  }
}
exports.GeofenceController = GeofenceController;