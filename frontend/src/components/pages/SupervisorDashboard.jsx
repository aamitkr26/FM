import { useRef, useState, useEffect } from 'react';
import { 
  Circle, X, ChevronRight, ZoomIn, ZoomOut, Maximize2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FleetMap } from '../FleetMap';
import { dashboardApi, alertsApi } from '../../services/api';
import wsService from '../../services/websocket';

const getVehicleStatus = (v) => {
  if (!v.lastIgnition) return 'stopped';
  if ((v.lastSpeed || 0) > 5) return 'moving';
  return 'idling';
};

const getStatusText = (v) => {
  const status = getVehicleStatus(v);
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
};

const transformVehicle = (v) => ({
  id: v.id,
  number: v.registrationNo || v.imei,
  manufacturer: v.make || 'unknown',
  status: getVehicleStatus(v),
  statusText: getStatusText(v),
  speed: v.lastSpeed || 0,
  lat: v.lastLat,
  lng: v.lastLng,
  address: 'Loading address...', // Could add reverse geocoding
  lastUpdated: getTimeAgo(v.lastSeen),
  todayTrips: 0, // Would come from trips API
  todayDistance: '0 km',
  totalKm: `${Math.round(v.gpsOdometer || 0)} km`,
  driverName: 'N/A',
  driverMobile: 'N/A',
  vehicleModel: v.model || 'N/A',
  vin: v.vin,
  make: v.make,
  model: v.model,
  year: v.year,
  fuelCapacity: v.fuelCapacity,
  lastIgnition: v.lastIgnition,
});

const transformVehicles = (data) => data.map(transformVehicle);

export function SupervisorDashboard({ onNavigate, selectedVehicleId }) {
  const [activeTab, setActiveTab] = useState('live');
  const baseZoom = 11;
  const mapZoom = baseZoom;
  const leafletMapRef = useRef(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleResetZoom = () => leafletMapRef.current?.setZoom(baseZoom);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch in parallel
        const [statsRes, vehiclesRes, alertsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getLiveVehicles(),
          alertsApi.getAll({ resolved: false, limit: 10 })
        ]);

        void statsRes;
        setVehicles(transformVehicles(vehiclesRes.data || []));
        setAlerts(alertsRes.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Setup WebSocket for real-time updates
    wsService.connect();
    
    const unsubVehicle = wsService.on('vehicle:update', (data) => {
      setVehicles(prev => prev.map(v => 
        v.id === data.vehicleId ? transformVehicle({ ...v, ...data }) : v
      ));
    });

    const unsubAlert = wsService.on('alert:new', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10));
    });

    // Refresh periodically
    const interval = setInterval(fetchDashboardData, 60000);

    return () => {
      unsubVehicle();
      unsubAlert();
      clearInterval(interval);
    };
  }, []);

  // Handle selected vehicle from props
  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        setDetailVehicle(vehicle);
      }
    }
  }, [selectedVehicleId, vehicles]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'moving': return '#10B981';
      case 'idling': return '#F59E0B';
      case 'stopped': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'live' && v.status !== 'moving') return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const vehicleStats = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    idling: vehicles.filter(v => v.status === 'idling').length,
    stopped: vehicles.filter(v => v.status === 'stopped').length,
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <p className="text-slate-600 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Main Map */}
      <div className="absolute inset-0">
        <FleetMap
          ref={leafletMapRef}
          vehicles={vehicles.filter(v => v.lat && v.lng).map(v => ({
            id: v.id,
            lat: v.lat,
            lng: v.lng,
            registrationNo: v.number,
            status: v.status,
            speed: v.speed,
          }))}
          center={[28.6139, 77.209]}
          zoom={mapZoom}
          onVehicleClick={(vehicleId) => {
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
              setDetailVehicle(vehicle);
            }
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Fleet Overview</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {vehicleStats.moving} Moving
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              {vehicleStats.idling} Idle
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
              {vehicleStats.stopped} Stopped
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Map Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-slate-100 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-slate-100 transition border-x border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-slate-100 transition"
              title="Reset Zoom"
            >
              <Maximize2 className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Vehicle List */}
      <div className="absolute left-6 top-20 bottom-6 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col overflow-hidden z-10">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'live'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Vehicles
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'all' && (
          <div className="px-4 py-3 border-b border-slate-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="moving">Moving</option>
              <option value="idling">Idling</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>
        )}

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No vehicles found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`flex items-center bg-slate-50 border rounded-xl p-3 cursor-pointer hover:bg-slate-100 transition-colors ${
                    detailVehicle?.id === vehicle.id ? 'border-green-500 bg-green-50' : 'border-slate-200'
                  }`}
                  onClick={() => {
                    setDetailVehicle(vehicle);
                  }}
                >
                  {/* Status Indicator */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
                    style={{ backgroundColor: `${getStatusColor(vehicle.status)}20` }}
                  >
                    <Circle
                      className="w-4 h-4"
                      style={{
                        color: getStatusColor(vehicle.status),
                        strokeWidth: 1.5,
                        fill: vehicle.status === 'stopped' ? getStatusColor(vehicle.status) : 'none'
                      }}
                    />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {vehicle.number}
                    </p>
                    <p className="text-xs text-slate-600">
                      {vehicle.statusText} • {vehicle.speed} km/h
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Alerts */}
      <div className="absolute right-6 top-20 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden z-10">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Alerts</h3>
        </div>
        <div className="max-h-96 overflow-y-auto px-4 py-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition"
                  onClick={() => onNavigate('fuel')}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{getTimeAgo(alert.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      <AnimatePresence>
        {detailVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-6"
            onClick={() => setDetailVehicle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{detailVehicle.number}</h2>
                  <p className="text-sm text-slate-600">
                    {detailVehicle.make} {detailVehicle.model} • {detailVehicle.year}
                  </p>
                </div>
                <button
                  onClick={() => setDetailVehicle(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-6">
                {/* Status Overview */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Current Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Status</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{detailVehicle.statusText}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Speed</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{detailVehicle.speed} km/h</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Last Updated</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{detailVehicle.lastUpdated}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Total Distance</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{detailVehicle.totalKm}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Vehicle Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">VIN</span>
                      <span className="text-sm font-medium text-slate-900">{detailVehicle.vin || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Model</span>
                      <span className="text-sm font-medium text-slate-900">{detailVehicle.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Fuel Capacity</span>
                      <span className="text-sm font-medium text-slate-900">{detailVehicle.fuelCapacity || 0} L</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onNavigate('fuel', detailVehicle.id);
                      setDetailVehicle(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    View Fuel Reports
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('routes', detailVehicle.id);
                      setDetailVehicle(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
                  >
                    View Routes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
