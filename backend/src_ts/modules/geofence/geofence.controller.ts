import { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler';
import { GeofenceService } from './geofence.service';

const service = new GeofenceService();

const polygonSchema = z
  .array(z.array(z.number()).length(2))
  .min(3, 'Polygon must have at least 3 points');

const geofenceCreateSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().optional(),
    type: z.enum(['circle', 'polygon']),
    centerLat: z.number().nullable().optional(),
    centerLng: z.number().nullable().optional(),
    radius: z.number().nullable().optional(),
    polygon: z.unknown().nullable().optional(),
    active: z.boolean().optional(),
    expectedArrivalTime: z.union([z.string(), z.date()]).nullable().optional(),
  })
  .strict();

const geofenceUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    type: z.enum(['circle', 'polygon']).optional(),
    centerLat: z.number().nullable().optional(),
    centerLng: z.number().nullable().optional(),
    radius: z.number().nullable().optional(),
    polygon: z.unknown().nullable().optional(),
    active: z.boolean().optional(),
    expectedArrivalTime: z.union([z.string(), z.date()]).nullable().optional(),
  })
  .strict();

function coerceDate(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      throw new AppError('Invalid expectedArrivalTime', 400);
    }
    return d;
  }
  throw new AppError('Invalid expectedArrivalTime', 400);
}

function normalizePolygon(value: unknown): number[][] {
  return polygonSchema.parse(value);
}

function isPrismaUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2002'
  );
}

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === 'P2025'
  );
}

export class GeofenceController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const geofences = await service.getAll();
      res.json({ count: geofences.length, data: geofences });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const geofence = await service.getById(id);
      if (!geofence) {
        res.status(404).json({ message: 'Geofence not found' });
        return;
      }
      res.json({ data: geofence });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = geofenceCreateSchema.parse(req.body);

      const expectedArrivalTime = coerceDate(input.expectedArrivalTime);

      if (input.type === 'circle') {
        if (typeof input.centerLat !== 'number' || typeof input.centerLng !== 'number') {
          throw new AppError('centerLat and centerLng are required for circle geofence', 400);
        }
        if (typeof input.radius !== 'number' || input.radius <= 0) {
          throw new AppError('radius must be a positive number for circle geofence', 400);
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
          expectedArrivalTime: expectedArrivalTime ?? null,
        });

        res.status(201).json({ data: geofence });
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
        expectedArrivalTime: expectedArrivalTime ?? null,
      });
      res.status(201).json({ data: geofence });
    } catch (err) {
      if (isPrismaUniqueConstraintError(err)) {
        next(new AppError('A geofence with this name already exists', 409));
        return;
      }
      if (err instanceof z.ZodError) {
        next(new AppError(err.issues[0]?.message || 'Invalid geofence payload', 400));
        return;
      }
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const existing = await service.getById(id);
      if (!existing) {
        res.status(404).json({ message: 'Geofence not found' });
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
          throw new AppError('polygon is not valid for circle geofence', 400);
        }
        if (typeof finalCenterLat !== 'number' || typeof finalCenterLng !== 'number') {
          throw new AppError('centerLat and centerLng are required for circle geofence', 400);
        }
        if (typeof finalRadius !== 'number' || finalRadius <= 0) {
          throw new AppError('radius must be a positive number for circle geofence', 400);
        }

        const geofence = await service.update(id, {
          ...patch,
          type: 'circle',
          centerLat: finalCenterLat,
          centerLng: finalCenterLng,
          radius: finalRadius,
          polygon: null,
          expectedArrivalTime: expectedArrivalTime ?? (patch.expectedArrivalTime === undefined ? undefined : null),
        });

        res.json({ data: geofence });
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
        expectedArrivalTime: expectedArrivalTime ?? (patch.expectedArrivalTime === undefined ? undefined : null),
      });
      res.json({ data: geofence });
    } catch (err) {
      if (isPrismaUniqueConstraintError(err)) {
        next(new AppError('A geofence with this name already exists', 409));
        return;
      }
      if (err instanceof z.ZodError) {
        next(new AppError(err.issues[0]?.message || 'Invalid geofence payload', 400));
        return;
      }
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const geofence = await service.delete(id);
      res.json({ data: geofence });
    } catch (err) {
      if (isPrismaNotFoundError(err)) {
        res.status(404).json({ message: 'Geofence not found' });
        return;
      }
      next(err);
    }
  }

  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId ? String(req.query.vehicleId) : undefined;
      const resolved =
        req.query.resolved === 'true'
          ? true
          : req.query.resolved === 'false'
            ? false
            : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

      const alerts = await service.getAlerts({ vehicleId, resolved, limit });
      res.json({ count: alerts.length, data: alerts });
    } catch (err) {
      next(err);
    }
  }
}
