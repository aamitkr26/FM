import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const defaultMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
export function FleetMap(props) {
    const center = props.center ?? [28.6139, 77.209];
    const zoom = props.zoom ?? 11;
    const providedVehicles = props.vehicles;
    const tileUrl = props.tileUrl ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const [liveById, setLiveById] = useState({});
    const socketRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const externalMapRef = props.mapRef;
    const backendUrl = props.backendUrl ??
        (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000');
    useEffect(() => {
        // If caller supplies vehicles, we don't auto-connect.
        if (providedVehicles)
            return;
        const socket = io(backendUrl, {
            path: "/socket.io",
            transports: ["websocket", "polling"],
        });
        socketRef.current = socket;
        const onUpdate = (data) => {
            try {
                const parsed = typeof data === "string" ? JSON.parse(data) : data;
                const id = parsed.imei ? String(parsed.imei) : parsed.vehicleId ? String(parsed.vehicleId) : undefined;
                const lat = typeof parsed.lat === "number" ? parsed.lat : undefined;
                const lng = typeof parsed.lng === "number" ? parsed.lng : typeof parsed.lon === "number" ? parsed.lon : undefined;
                if (!id || lat == null || lng == null)
                    return;
                setLiveById((prev) => ({
                    ...prev,
                    [id]: { id, label: id, lat, lng },
                }));
            }
            catch {
                // ignore bad payloads
            }
        };
        socket.on("vehicle:update", onUpdate);
        return () => {
            socket.off("vehicle:update", onUpdate);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [backendUrl, providedVehicles]);
    const vehicles = useMemo(() => {
        if (providedVehicles)
            return providedVehicles;
        return Object.values(liveById);
    }, [providedVehicles, liveById]);
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        if (typeof props.zoom === "number" && map.getZoom() !== props.zoom) {
            map.setZoom(props.zoom);
        }
    }, [props.zoom]);
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map)
            return;
        // Remove any default Leaflet zoom control in case it gets injected by plugins.
        if (map.zoomControl) {
            map.removeControl(map.zoomControl);
        }
    }, []);
    return (<div className={props.className} style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} className="absolute inset-0 z-0" style={{ height: "100%", width: "100%" }} whenCreated={(map) => {
            mapInstanceRef.current = map;
            if (externalMapRef)
                externalMapRef.current = map;
            props.onZoomChange?.(map.getZoom());
            map.on("zoomend", () => props.onZoomChange?.(map.getZoom()));
        }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={tileUrl}/>
        {vehicles.map((vehicle) => (<Marker key={vehicle.id} position={[vehicle.lat, vehicle.lng]} icon={defaultMarkerIcon}>
            <Popup>
              <div className="text-sm text-slate-900">
                <div className="font-semibold">{vehicle.label ?? vehicle.id}</div>
                <div className="text-xs text-slate-600">
                  {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>))}
      </MapContainer>
    </div>);
}
