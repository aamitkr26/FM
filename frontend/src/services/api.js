// API Service Layer for Fleet Management System
// Centralized API communication with the backend

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('fleet.token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic request handler
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    let data = null;
    
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // Handle 401 Unauthorized - clear auth and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('fleet.token');
      localStorage.removeItem('fleet.role');
      localStorage.removeItem('fleet.email');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired. Please login again.', 401, data);
    }

    if (!response.ok) {
      throw new ApiError(
        (data && (data.error || data.message)) || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Network error',
      0,
      null
    );
  }
};

// Auth API
export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, name, role) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),

  me: () => request('/api/auth/me'),

  refreshToken: (refreshToken) =>
    request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// Vehicles API
export const vehiclesApi = {
  getAll: () => request('/api/vehicles'),

  getById: (id) => request(`/api/vehicles/${id}`),

  create: (vehicleData) =>
    request('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    }),

  update: (id, vehicleData) =>
    request(`/api/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(vehicleData),
    }),

  delete: (id) =>
    request(`/api/vehicles/${id}`, {
      method: 'DELETE',
    }),

  getLastPositions: () => request('/api/vehicles/positions'),
};

// Telemetry API
export const telemetryApi = {
  getByVehicle: (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/telemetry/vehicle/${vehicleId}${queryParams ? `?${queryParams}` : ''}`);
  },

  getLatest: (vehicleId) =>
    request(`/api/telemetry/vehicle/${vehicleId}/latest`),
};

// Fuel API
export const fuelApi = {
  getEvents: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/fuel/events${queryParams ? `?${queryParams}` : ''}`);
  },

  getByVehicle: (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/fuel/vehicle/${vehicleId}${queryParams ? `?${queryParams}` : ''}`);
  },

  getTheftAlerts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/fuel/theft${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Alerts API
export const alertsApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/alerts${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: (id) => request(`/api/alerts/${id}`),

  resolve: (id) =>
    request(`/api/alerts/${id}/resolve`, {
      method: 'PATCH',
    }),

  unresolve: (id) =>
    request(`/api/alerts/${id}/unresolve`, {
      method: 'PATCH',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => request('/api/dashboard/statistics'),

  getLiveVehicles: () => request('/api/dashboard/live'),

  getRecentAlerts: () => request('/api/dashboard/alerts'),

  getFuelStats: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/dashboard/fuel-stats${queryParams ? `?${queryParams}` : ''}`);
  },

  getTripStats: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/dashboard/trip-stats${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Geofence API (to be implemented in backend if not exists)
export const geofenceApi = {
  getAll: () => request('/api/geofence'),

  getById: (id) => request(`/api/geofence/${id}`),

  create: (geofenceData) =>
    request('/api/geofence', {
      method: 'POST',
      body: JSON.stringify(geofenceData),
    }),

  update: (id, geofenceData) =>
    request(`/api/geofence/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(geofenceData),
    }),

  delete: (id) =>
    request(`/api/geofence/${id}`, {
      method: 'DELETE',
    }),

  getAlerts: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/geofence/alerts${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Trips API (to be implemented in backend if not exists)
export const tripsApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/trips${queryParams ? `?${queryParams}` : ''}`);
  },

  getByVehicle: (vehicleId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/api/trips/vehicle/${vehicleId}${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: (id) => request(`/api/trips/${id}`),
};

// Export API instance
export const api = {
  auth: authApi,
  vehicles: vehiclesApi,
  telemetry: telemetryApi,
  fuel: fuelApi,
  alerts: alertsApi,
  dashboard: dashboardApi,
  geofence: geofenceApi,
  trips: tripsApi,
};

export default api;
