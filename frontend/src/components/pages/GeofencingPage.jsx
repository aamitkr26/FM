import { useState, useEffect } from 'react';
import { 
  MapPin, Plus, AlertCircle, Circle, Shield 
} from 'lucide-react';
import { geofenceApi } from '../../services/api';

export function GeofencingPage() {
  const [geofences, setGeofences] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [geofencesRes, alertsRes] = await Promise.all([
        geofenceApi.getAll(),
        geofenceApi.getAlerts({ resolved: false, limit: 20 }),
      ]);

      setGeofences(geofencesRes.data || []);
      setAlerts(alertsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching geofence data:', err);
      setError('Failed to load geofences');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertTypeColor = (alertType) => {
    switch (alertType) {
      case 'ENTRY': return 'text-green-600 bg-green-100';
      case 'EXIT': return 'text-red-600 bg-red-100';
      case 'DWELL': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading geofences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Geofencing</h1>
              <p className="text-slate-600 mt-1">
                Manage location boundaries and monitor violations
              </p>
            </div>
            <button
              onClick={() => alert('Create geofence feature coming soon')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Geofence
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Geofences</p>
                <p className="text-2xl font-bold text-slate-900">{geofences.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Geofences</p>
                <p className="text-2xl font-bold text-slate-900">
                  {geofences.filter(g => g.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Alerts</p>
                <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Geofences List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Geofences</h3>
          </div>
          {geofences.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No geofences created yet</p>
              <p className="text-sm mt-1">Create your first geofence to start monitoring locations</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {geofences.map((geofence) => (
                <div key={geofence.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        geofence.active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {geofence.type === 'circle' ? (
                          <Circle className={`h-5 w-5 ${
                            geofence.active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        ) : (
                          <MapPin className={`h-5 w-5 ${
                            geofence.active ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{geofence.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {geofence.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500">
                            Type: {geofence.type.toUpperCase()}
                          </span>
                          {geofence.type === 'circle' && geofence.radius && (
                            <span className="text-xs text-slate-500">
                              Radius: {geofence.radius}m
                            </span>
                          )}
                          <span className={`text-xs font-medium ${
                            geofence.active ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {geofence.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Recent Alerts</h3>
          </div>
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No active geofence alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alertType)}`}>
                      {alert.alertType}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Vehicle: {alert.vehicle?.registrationNo || 'Unknown'}</span>
                        <span>Geofence: {alert.geofence?.name || 'Unknown'}</span>
                        <span>{formatDate(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
