import { useState, useEffect } from 'react';
import { 
  AlertTriangle, TrendingDown, TrendingUp, Filter, 
  Download, AlertCircle
} from 'lucide-react';
import { fuelApi, vehiclesApi } from '../../services/api';

export function FuelReports() {
  const [fuelEvents, setFuelEvents] = useState([]);
  const [theftAlerts, setTheftAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    vehicleId: '',
    eventType: '',
    severity: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, theftRes, vehiclesRes] = await Promise.all([
        fuelApi.getEvents({ limit: 100 }),
        fuelApi.getTheftAlerts({ limit: 20 }),
        vehiclesApi.getAll(),
      ]);

      setFuelEvents(eventsRes.data || []);
      setTheftAlerts(theftRes.data || []);
      setVehicles(vehiclesRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching fuel data:', err);
      setError('Failed to load fuel reports');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType) => {
    if (eventType === 'THEFT') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (eventType === 'REFILL') return <TrendingUp className="h-5 w-5 text-green-600" />;
    return <TrendingDown className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = fuelEvents.filter((event) => {
    if (filters.vehicleId && event.vehicleId !== filters.vehicleId) return false;
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (filters.severity && event.severity !== filters.severity) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading fuel reports...</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Fuel Reports</h1>
              <p className="text-slate-600 mt-1">Monitor fuel consumption and theft detection</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Theft Alerts Summary */}
        {theftAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  {theftAlerts.length} Active Theft Alert{theftAlerts.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Immediate attention required for suspicious fuel events
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Total Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{fuelEvents.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Theft Alerts</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {fuelEvents.filter(e => e.eventType === 'THEFT').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Refills</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {fuelEvents.filter(e => e.eventType === 'REFILL').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-slate-600">Avg Consumption</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {fuelEvents.length > 0 
                ? (fuelEvents.reduce((sum, e) => sum + Math.abs(e.delta || 0), 0) / fuelEvents.length).toFixed(1)
                : '0'} L
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.vehicleId}
              onChange={(e) => setFilters({ ...filters, vehicleId: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNo || v.imei}
                </option>
              ))}
            </select>

            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Event Types</option>
              <option value="THEFT">Theft</option>
              <option value="REFILL">Refill</option>
              <option value="LOSS">Loss</option>
              <option value="NORMAL">Normal</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="red">Critical (Red)</option>
              <option value="yellow">Warning (Yellow)</option>
              <option value="green">Normal (Green)</option>
            </select>

            <button
              onClick={() => setFilters({ vehicleId: '', eventType: '', severity: '' })}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Fuel Events Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Fuel Events</h3>
          </div>
          <div className="overflow-x-auto">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No fuel events found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Event Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Change (L)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Pattern
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEvents.map((event) => {
                    const vehicle = vehicles.find(v => v.id === event.vehicleId);
                    return (
                      <tr key={event.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">
                            {vehicle?.registrationNo || vehicle?.imei || 'Unknown'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.eventType)}
                            <span className="text-sm text-slate-700">{event.eventType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(event.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${
                            event.delta > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {event.delta > 0 ? '+' : ''}{event.delta.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {event.pattern}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
