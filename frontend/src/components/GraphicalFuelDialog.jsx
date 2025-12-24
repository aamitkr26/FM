import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { X, AlertTriangle, Send } from 'lucide-react';
// Vehicle data configuration
const vehicleData = {
    'TN-01-AB-1234': {
        name: 'TN-01-AB-1234',
        hasAnomaly: true,
        dataPoints: [
            { time: '10:00', fuel: 210 },
            { time: '10:15', fuel: 207 },
            { time: '10:30', fuel: 205 },
            { time: '10:35', fuel: 205 }, // Stopped - sensor not working, shows last reading
            { time: '10:40', fuel: 165 }, // Engine started - drop detected!
            { time: '10:45', fuel: 163 },
        ],
        anomalyDetails: {
            time: '10:40 AM',
            fuelDropped: 40,
            status: 'Engine Started',
            location: 'Sector 45',
        },
    },
    'TN-01-AB-1235': {
        name: 'TN-01-AB-1235',
        hasAnomaly: false,
        dataPoints: [
            { time: '10:00', fuel: 195 },
            { time: '10:15', fuel: 193 },
            { time: '10:30', fuel: 190 },
            { time: '10:35', fuel: 188 },
            { time: '10:40', fuel: 186 },
            { time: '10:45', fuel: 184 },
        ],
    },
    'TN-01-AB-1236': {
        name: 'TN-01-AB-1236',
        hasAnomaly: true,
        dataPoints: [
            { time: '10:00', fuel: 200 },
            { time: '10:15', fuel: 197 },
            { time: '10:30', fuel: 195 },
            { time: '10:35', fuel: 195 }, // Stopped - sensor not working
            { time: '10:40', fuel: 150 }, // Engine started - drop detected!
            { time: '10:45', fuel: 147 },
        ],
        anomalyDetails: {
            time: '10:40 AM',
            fuelDropped: 45,
            status: 'Engine Started',
            location: 'Sector 28',
        },
    },
    'TN-01-AB-1238': {
        name: 'TN-01-AB-1238',
        hasAnomaly: false,
        dataPoints: [
            { time: '10:00', fuel: 180 },
            { time: '10:15', fuel: 178 },
            { time: '10:30', fuel: 175 },
            { time: '10:35', fuel: 173 },
            { time: '10:40', fuel: 171 },
            { time: '10:45', fuel: 169 },
        ],
    },
};
export function GraphicalFuelDialog({ open, onOpenChange, vehicleNumber }) {
    const canvasRef = useRef(null);
    const [alertSent, setAlertSent] = useState(false);
    const currentVehicle = vehicleNumber ? vehicleData[vehicleNumber] || vehicleData['TN-01-AB-1234'] : vehicleData['TN-01-AB-1234'];
    const drawFuelChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const width = canvas.width;
        const height = canvas.height;
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        // Chart dimensions
        const padding = { top: 80, right: 60, bottom: 80, left: 80 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        // Data
        const times = currentVehicle.dataPoints.map(d => d.time);
        const fuels = currentVehicle.dataPoints.map(d => d.fuel);
        const minFuel = 150;
        const maxFuel = 220;
        const fuelRange = maxFuel - minFuel;
        // Draw title
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Fuel Level vs Time', width / 2, 40);
        // Draw vehicle number
        ctx.fillStyle = currentVehicle.hasAnomaly ? '#dc2626' : '#059669';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`Vehicle: ${currentVehicle.name}`, padding.left, 65);
        // Draw light grey gridlines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        // Horizontal gridlines (for fuel levels)
        for (let i = 0; i <= 7; i++) {
            const y = padding.top + (chartHeight / 7) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }
        // Vertical gridlines (for time)
        for (let i = 0; i < times.length; i++) {
            const x = padding.left + (chartWidth / (times.length - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartHeight);
            ctx.stroke();
        }
        // Draw grey background shading for "Vehicle Stopped" (between 10:30 and 10:40)
        if (currentVehicle.hasAnomaly) {
            const stopStartIndex = 2; // 10:30
            const stopEndIndex = 3.66; // Approximately 10:40
            const x1 = padding.left + (chartWidth / (times.length - 1)) * stopStartIndex;
            const x2 = padding.left + (chartWidth / (times.length - 1)) * stopEndIndex;
            ctx.fillStyle = 'rgba(203, 213, 225, 0.3)';
            ctx.fillRect(x1, padding.top, x2 - x1, chartHeight);
            // Add label for vehicle stopped
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Vehicle Stopped', (x1 + x2) / 2, padding.top - 10);
        }
        // Draw axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.stroke();
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();
        // Draw Y-axis label
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.save();
        ctx.translate(20, padding.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Fuel Level (Litres)', 0, 0);
        ctx.restore();
        // Draw X-axis label
        ctx.textAlign = 'center';
        ctx.fillText('Time', padding.left + chartWidth / 2, height - 20);
        // Draw Y-axis values
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#475569';
        for (let i = 0; i <= 7; i++) {
            const fuelValue = maxFuel - (fuelRange / 7) * i;
            const y = padding.top + (chartHeight / 7) * i;
            ctx.fillText(`${Math.round(fuelValue)}L`, padding.left - 10, y + 4);
        }
        // Draw X-axis values
        ctx.textAlign = 'center';
        ctx.fillStyle = '#475569';
        for (let i = 0; i < times.length; i++) {
            const x = padding.left + (chartWidth / (times.length - 1)) * i;
            ctx.fillText(times[i], x, padding.top + chartHeight + 30);
        }
        // Convert fuel data to coordinates
        const points = fuels.map((fuel, i) => {
            const x = padding.left + (chartWidth / (times.length - 1)) * i;
            const y = padding.top + chartHeight - ((fuel - minFuel) / fuelRange) * chartHeight;
            return { x, y };
        });
        // Add fuel sloshing effect (zigzag) - simulate realistic fuel movement
        const sloshingPoints = [];
        for (let i = 0; i < points.length; i++) {
            const basePoint = points[i];
            if (i === 0) {
                sloshingPoints.push(basePoint);
            }
            else {
                // Add intermediate sloshing points between main readings
                const prevPoint = points[i - 1];
                const segmentCount = 8; // Number of sloshing segments between readings
                for (let j = 1; j <= segmentCount; j++) {
                    const progress = j / segmentCount;
                    const x = prevPoint.x + (basePoint.x - prevPoint.x) * progress;
                    // Create realistic fuel sloshing (±2-5 liters variation)
                    const sloshAmplitude = 3; // liters of variation
                    const sloshOffset = Math.sin(j * Math.PI * 0.7) * sloshAmplitude * (Math.random() * 0.5 + 0.5);
                    const sloshPixels = (sloshOffset / fuelRange) * chartHeight;
                    const baseY = prevPoint.y + (basePoint.y - prevPoint.y) * progress;
                    const y = baseY + sloshPixels;
                    sloshingPoints.push({ x, y });
                }
            }
        }
        // Add final point
        sloshingPoints.push(points[points.length - 1]);
        // Draw the main line with sloshing
        ctx.strokeStyle = '#3b82f6'; // Default blue color
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sloshingPoints[0].x, sloshingPoints[0].y);
        for (let i = 1; i < sloshingPoints.length; i++) {
            ctx.lineTo(sloshingPoints[i].x, sloshingPoints[i].y);
        }
        ctx.stroke();
        // Draw main data points (actual sensor readings)
        points.forEach((point) => {
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
        // Highlight sudden drop if there's an anomaly
        if (currentVehicle.hasAnomaly && currentVehicle.anomalyDetails) {
            const anomalyIndex = 4; // 10:40
            const anomalyPoint = points[anomalyIndex];
            // Draw vertical red line behind the point
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.lineWidth = 40;
            ctx.beginPath();
            ctx.moveTo(anomalyPoint.x, padding.top);
            ctx.lineTo(anomalyPoint.x, padding.top + chartHeight);
            ctx.stroke();
            // Draw red circular marker
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(anomalyPoint.x, anomalyPoint.y, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Draw tooltip box
            const tooltipX = anomalyPoint.x + 30;
            const tooltipY = anomalyPoint.y - 80;
            const tooltipWidth = 200;
            const tooltipHeight = 100;
            // Tooltip background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
            ctx.fill();
            ctx.stroke();
            // Tooltip content
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`Fuel Dropped: ${currentVehicle.anomalyDetails.fuelDropped}L`, tooltipX + 10, tooltipY + 25);
            ctx.font = '12px Inter';
            ctx.fillStyle = '#475569';
            ctx.fillText(`Time: ${currentVehicle.anomalyDetails.time}`, tooltipX + 10, tooltipY + 45);
            ctx.fillText(`Vehicle Status: ${currentVehicle.anomalyDetails.status}`, tooltipX + 10, tooltipY + 65);
            ctx.fillText(`Location: ${currentVehicle.anomalyDetails.location}`, tooltipX + 10, tooltipY + 85);
            // Warning icon
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 20px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('⚠', anomalyPoint.x, anomalyPoint.y - 20);
            // Draw "Engine Started" bracket annotation at 10:40
            const bracketX = anomalyPoint.x;
            const bracketTopY = padding.top + chartHeight + 50;
            const bracketHeight = 15;
            // Draw bracket shape
            ctx.strokeStyle = '#059669';
            ctx.fillStyle = '#059669';
            ctx.lineWidth = 2;
            // Left vertical line
            ctx.beginPath();
            ctx.moveTo(bracketX - 15, bracketTopY);
            ctx.lineTo(bracketX - 15, bracketTopY + bracketHeight);
            ctx.stroke();
            // Bottom horizontal line
            ctx.beginPath();
            ctx.moveTo(bracketX - 15, bracketTopY + bracketHeight);
            ctx.lineTo(bracketX + 15, bracketTopY + bracketHeight);
            ctx.stroke();
            // Right vertical line
            ctx.beginPath();
            ctx.moveTo(bracketX + 15, bracketTopY);
            ctx.lineTo(bracketX + 15, bracketTopY + bracketHeight);
            ctx.stroke();
            // Text annotation
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('(Engine Started)', bracketX, bracketTopY + bracketHeight + 15);
        }
    }, [currentVehicle]);
    useEffect(() => {
        if (open) {
            drawFuelChart();
        }
    }, [open, drawFuelChart]);
    const handleAlertManager = () => {
        setAlertSent(true);
        setTimeout(() => {
            setAlertSent(false);
        }, 3000);
    };
    return (<div className={`fixed inset-0 z-40 ${open ? 'block' : 'hidden'}`} style={{ marginLeft: '240px' }} // Offset for sidebar
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)}/>
      
      {/* Content */}
      <div className="relative z-50 flex items-center justify-center min-h-screen p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white relative">
            <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24}/>
            </button>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Inter' }}>
                Fuel Level Analysis - {currentVehicle.name}
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                Real-time fuel monitoring and anomaly detection
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Main Chart */}
            <div className={`border-2 rounded-xl p-6 ${currentVehicle.hasAnomaly ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${currentVehicle.hasAnomaly
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'}`}>
                      {currentVehicle.hasAnomaly ? (<>
                          <AlertTriangle className="w-3 h-3"/>
                          Anomaly Detected
                        </>) : (<>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Normal Operation
                        </>)}
                    </span>
                  </p>
                </div>
                {currentVehicle.hasAnomaly && (<Button onClick={handleAlertManager} className="bg-red-600 hover:bg-red-700 flex items-center gap-2" disabled={alertSent}>
                    {alertSent ? (<>
                        <Send className="h-4 w-4"/>
                        Alert Sent!
                      </>) : (<>
                        <AlertTriangle className="h-4 w-4"/>
                        Alert to Manager
                      </>)}
                  </Button>)}
              </div>
              <canvas ref={canvasRef} width={1200} height={500} className="w-full"/>
              {currentVehicle.hasAnomaly && currentVehicle.anomalyDetails && (<div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4"/>
                    Alert Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">Anomaly Type:</p>
                      <p className="text-red-800 font-semibold">Sudden fuel drop</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Fuel Lost:</p>
                      <p className="text-red-800 font-semibold">{currentVehicle.anomalyDetails.fuelDropped} Liters</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Time:</p>
                      <p className="text-red-800 font-semibold">{currentVehicle.anomalyDetails.time}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Vehicle Status:</p>
                      <p className="text-red-800 font-semibold">{currentVehicle.anomalyDetails.status}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Location:</p>
                      <p className="text-red-800 font-semibold">{currentVehicle.anomalyDetails.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Recommendation:</p>
                      <p className="text-red-800 font-semibold">Immediate inspection required</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <p className="text-xs text-red-700">
                      <strong>Possible Causes:</strong> Fuel theft, tank leakage, sensor malfunction, or unauthorized fuel extraction
                    </p>
                  </div>
                </div>)}
              {!currentVehicle.hasAnomaly && (<p className="text-xs text-slate-500 mt-4">
                  This vehicle shows consistent fuel consumption pattern with no anomalies detected.
                </p>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
