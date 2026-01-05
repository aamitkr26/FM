"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MilitrackService = void 0;
var _env = require("../../config/env");
var _database = require("../../config/database");
var _logger = require("../../config/logger");
var _errorHandler = require("../../middleware/errorHandler");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
};
const fetchWithRetry = async (url, attempts, timeoutMs) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithTimeout(url, timeoutMs);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await sleep(400 * (i + 1));
      }
    }
  }
  throw lastErr;
};
const toNumber = value => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const toStringSafe = value => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};
const toBoolean = value => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return null;
};
const pick = (obj, keys) => {
  for (const k of keys) {
    if (k in obj) return obj[k];
  }
  return undefined;
};
const normalizeOne = raw => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw;
  const id = toStringSafe(pick(obj, ['id', 'deviceId', 'deviceID', 'imei', 'IMEI', 'terminalId', 'terminalID', 'uniqueId', 'uniqueID'])) ?? null;
  if (!id) return null;
  const label = toStringSafe(pick(obj, ['label', 'name', 'deviceName', 'vehicleNo', 'vehicleNumber', 'plate', 'plateNo', 'regNo'])) ?? id;
  const lat = toNumber(pick(obj, ['lat', 'latitude', 'gpsLat', 'gpsLatitude', 'y'])) ?? toNumber(pick(obj, ['lastLat', 'LastLat', 'lastLatitude', 'last_lat']));
  const lng = toNumber(pick(obj, ['lng', 'lon', 'long', 'longitude', 'gpsLng', 'gpsLon', 'gpsLongitude', 'x'])) ?? toNumber(pick(obj, ['lastLng', 'LastLng', 'lastLongitude', 'last_lng', 'lastLon']));
  if (lat == null || lng == null) return null;
  const speed = toNumber(pick(obj, ['speed', 'speedKmh', 'speedKMH', 'speedKph', 'spd'])) ?? toNumber(pick(obj, ['lastSpeed', 'LastSpeed']));
  const ignition = toBoolean(pick(obj, ['ignition', 'acc', 'ACC', 'engine', 'engineOn', 'engineStatus'])) ?? toBoolean(pick(obj, ['lastIgnition', 'LastIgnition']));
  const fuelLevel = toNumber(pick(obj, ['fuel', 'fuelLevel', 'fuel_level', 'fl', 'adc1'])) ?? null;
  const lastSeen = toStringSafe(pick(obj, ['lastSeen', 'lastUpdate', 'updatedAt', 'gpsTime', 'deviceTime', 'timestamp', 'time'])) ?? null;
  return {
    id,
    label,
    lat,
    lng,
    speed: speed == null ? null : speed,
    ignition,
    fuelLevel,
    lastSeen,
    raw
  };
};
const extractDeviceArray = payload => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload;
  const candidates = [obj.object, obj.data, obj.result, obj.results];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === 'object' && Array.isArray(c.data)) return c.data;
  }
  return [];
};
const parseTimestamp = value => {
  if (!value) return new Date();
  const num = Number(value);
  if (Number.isFinite(num)) {
    const asMs = num > 10_000_000_000 ? num : num * 1000;
    const d = new Date(asMs);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  return new Date();
};
const truncate = (value, max) => value.length > max ? `${value.slice(0, max)}…` : value;
const resolveRegistrationNo = async (desired, imei) => {
  if (!desired) return null;
  const clean = desired.trim();
  if (!clean) return null;
  const existing = await _database.prisma.vehicle.findFirst({
    where: {
      registrationNo: clean
    },
    select: {
      imei: true
    }
  });
  if (!existing || existing.imei === imei) return clean;
  const fallback = `${clean}-${imei.slice(-4)}`;
  const existing2 = await _database.prisma.vehicle.findFirst({
    where: {
      registrationNo: fallback
    },
    select: {
      imei: true
    }
  });
  if (!existing2 || existing2.imei === imei) return fallback;
  return null;
};
class MilitrackService {
  async getDeviceInfo(extraQuery) {
    const token = _env.env.militrack.token;
    if (!token) {
      throw new _errorHandler.AppError('Militrack token not configured', 501);
    }
    const baseUrl = _env.env.militrack.baseUrl;
    const url = new URL('/api/middleMan/getDeviceInfo', baseUrl);
    url.searchParams.set('accessToken', token);
    for (const [key, value] of Object.entries(extraQuery)) {
      if (!value) continue;
      if (key.toLowerCase() === 'accesstoken') continue;
      url.searchParams.set(key, value);
    }
    let resp;
    try {
      resp = await fetchWithRetry(url.toString(), 3, 12_000);
    } catch (err) {
      _logger.logger.warn('Militrack request failed', {
        err: err instanceof Error ? err.message : err
      });
      throw new _errorHandler.AppError('Failed to reach Militrack', 502);
    }
    const text = await resp.text();
    _logger.logger.debug('Militrack raw response', {
      status: resp.status,
      body: truncate(text || '', 2000)
    });
    let parsed = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    if (!resp.ok) {
      const message = parsed && typeof parsed === 'object' && 'message' in parsed ? String(parsed.message) : `Militrack error (${resp.status})`;
      throw new _errorHandler.AppError(message, 502);
    }
    return parsed;
  }
  async listDevices(extraQuery) {
    const payload = await this.getDeviceInfo(extraQuery);
    const rows = extractDeviceArray(payload);
    const devices = [];
    for (const r of rows) {
      const d = normalizeOne(r);
      if (d) devices.push(d);
    }
    return devices;
  }
  async syncDevicesToDb(devices) {
    for (const d of devices) {
      const lastSeen = parseTimestamp(d.lastSeen);
      const registrationNo = await resolveRegistrationNo(d.label || null, d.id);
      const vehicle = await _database.prisma.vehicle.upsert({
        where: {
          imei: d.id
        },
        update: {
          registrationNo,
          make: 'militrack',
          lastLat: d.lat,
          lastLng: d.lng,
          lastSeen,
          lastSpeed: d.speed == null ? null : d.speed,
          lastIgnition: d.ignition,
          status: 'active'
        },
        create: {
          imei: d.id,
          registrationNo,
          make: 'militrack',
          model: null,
          year: null,
          vin: null,
          fuelCapacity: null,
          lastLat: d.lat,
          lastLng: d.lng,
          lastSeen,
          lastSpeed: d.speed == null ? null : d.speed,
          lastIgnition: d.ignition,
          gpsOdometer: 0,
          dashOdometer: 0,
          status: 'active'
        },
        select: {
          id: true
        }
      });
      await _database.prisma.telemetry.create({
        data: {
          vehicleId: vehicle.id,
          timestamp: lastSeen,
          latitude: d.lat,
          longitude: d.lng,
          speed: d.speed == null ? 0 : d.speed,
          ignition: d.ignition == null ? false : d.ignition,
          motion: d.speed != null ? d.speed > 1 : null,
          fuelLevel: d.fuelLevel,
          raw: d.raw
        }
      });
    }
  }
  async listStoredDevices() {
    const vehicles = await _database.prisma.vehicle.findMany({
      where: {
        make: 'militrack',
        status: 'active',
        lastLat: {
          not: null
        },
        lastLng: {
          not: null
        }
      },
      select: {
        imei: true,
        registrationNo: true,
        lastLat: true,
        lastLng: true,
        lastSpeed: true,
        lastIgnition: true,
        lastSeen: true
      },
      orderBy: {
        registrationNo: 'asc'
      },
      take: 500
    });
    return vehicles.map(v => ({
      id: v.imei,
      label: v.registrationNo || v.imei,
      lat: v.lastLat,
      lng: v.lastLng,
      speed: v.lastSpeed ?? null,
      ignition: v.lastIgnition ?? null,
      lastSeen: v.lastSeen ? v.lastSeen.toISOString() : null,
      raw: null
    }));
  }
}
exports.MilitrackService = MilitrackService;
