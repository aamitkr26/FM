import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Filter, AlertCircle } from 'lucide-react';
import { alertsApi } from '../../services/api';

export function ComplaintsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { severity: filter } : {};
      const response = await alertsApi.getAll(params);
      setAlerts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (id) => {
    try {
      await alertsApi.resolve(id);
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (severity === 'warning') return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading alerts...</p>
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

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  return (
    <div className="h-screen bg-slate-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900">Alerts & Events</h1>
          <p className="text-slate-600 mt-1">Monitor system alerts and security events</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Total Alerts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Critical</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Warnings</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.warning}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings Only</option>
              <option value="info">Info Only</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">All Alerts</h3>
          </div>
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No alerts found</p>
              <p className="text-sm mt-1">Everything looks good!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(alert.createdAt).toLocaleString()}
                            </span>
                            {alert.resolved && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Resolved
                              </span>
                            )}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Resolve
                          </button>
                        )}
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
