import { useState, useEffect } from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { FleetMap } from '../FleetMap';
import { dashboardApi } from '../../services/api';
import wsService from '../../services/websocket';

export function VehicleTracking() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        moving: 0,
        idle: 0,
        warning: 0,
        stopped: 0,
    });

    // Fetch initial vehicle positions
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const response = await dashboardApi.getLive();
                const vehicleData = response.data || [];
                
                // Transform backend data to map format
                const transformed = vehicleData.map(v => ({
                    id: v.id,
                    registrationNo: v.registrationNo || v.imei,
                    lat: v.lastLat,
                    lng: v.lastLng,
                    speed: v.lastSpeed || 0,
                    ignition: v.lastIgnition,
                    status: getVehicleStatus(v),
                })).filter(v => v.lat && v.lng);
                
                setVehicles(transformed);
                updateStats(transformed);
                setError(null);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Failed to load vehicles');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();

        // Set up WebSocket for real-time updates
        wsService.connect();
        const unsubscribe = wsService.on('vehicle:update', (data) => {
            setVehicles(prev => {
                const updated = prev.map(v => 
                    v.id === data.vehicleId 
                        ? { ...v, ...data, status: getVehicleStatus(data) }
                        : v
                );
                updateStats(updated);
                return updated;
            });
        });

        // Refresh every 30 seconds as fallback
        const interval = setInterval(fetchVehicles, 30000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const getVehicleStatus = (vehicle) => {
        if (!vehicle.lastIgnition) return 'stopped';
        if (vehicle.lastSpeed > 5) return 'moving';
        return 'idle';
    };

    const updateStats = (vehicleList) => {
        const counts = {
            moving: 0,
            idle: 0,
            warning: 0,
            stopped: 0,
        };
        
        vehicleList.forEach(v => {
            if (v.status === 'moving') counts.moving++;
            else if (v.status === 'idle') counts.idle++;
            else if (v.status === 'stopped') counts.stopped++;
        });
        
        setStats(counts);
    };

    const defaultCenter = [28.6139, 77.209];

    if (loading && vehicles.length === 0) {
        return (
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading vehicles...</p>
                </div>
            </div>
        );
    }

    if (error && vehicles.length === 0) {
        return (
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error}</p>
                    <p className="text-slate-600 mt-2">Please check your connection and try again</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-slate-100">
            <FleetMap 
                className="absolute inset-0" 
                center={defaultCenter} 
                zoom={12} 
                vehicles={vehicles}
            />

            {/* Map Legend */}
            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl">
                <h4 className="text-sm text-slate-900 mb-3">Live Fleet Status</h4>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-500 p-2 rounded-full">
                            <Navigation className="h-3 w-3 text-white"/>
                        </div>
                        <span className="text-xs text-slate-700">Moving ({stats.moving})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-500 p-2 rounded-full">
                            <Navigation className="h-3 w-3 text-white"/>
                        </div>
                        <span className="text-xs text-slate-700">Idle ({stats.idle})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-red-500 p-2 rounded-full">
                            <Navigation className="h-3 w-3 text-white"/>
                        </div>
                        <span className="text-xs text-slate-700">Warning ({stats.warning})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-500 p-2 rounded-full">
                            <Navigation className="h-3 w-3 text-white"/>
                        </div>
                        <span className="text-xs text-slate-700">Stopped ({stats.stopped})</span>
                    </div>
                </div>
            </div>

            {/* Map Header */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-[#10b981]"/>
                    <div>
                        <h3 className="text-slate-900">Live Fleet Tracking</h3>
                        <p className="text-xs text-slate-600">
                            Real-time fleet monitoring • {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
