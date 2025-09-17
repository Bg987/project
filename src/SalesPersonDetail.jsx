import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

//convert into hour minute format
const getTimeString = (date) => {
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
};

export default function SalesPersonDetail({ salesperson, onBack }) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const filteredHistory = salesperson.history.filter((h) => {
        const timeStr = getTimeString(h.time);
        return (!startTime || timeStr >= startTime) && (!endTime || timeStr <= endTime);
    });

    return (
        <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
            {/* Header */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: "#1E1E2F",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px",
                    zIndex: 1000,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        marginRight: "20px",
                        padding: "8px 15px",
                        border: "none",
                        borderRadius: "5px",
                        background: "#FF5C5C",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginBottom: "5px",
                    }}
                >
                    ← Back
                </button>
                <h2 style={{ margin: 0, fontSize: "1.2rem", flex: 1 }}>
                    {salesperson.name}'s Movement History
                </h2>
            </div>

            {/* Time Filter Panel */}
            <div
                style={{
                    position: "absolute",
                    top: "70px",
                    left: "20px",
                    zIndex: 1000,
                    background: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    width: "200px",
                    maxWidth: "90vw",
                }}
            >
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                    Start Time:
                </label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        marginBottom: "10px",
                    }}
                />

                <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                    End Time:
                </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>

            {/* Map */}
            <MapContainer
                center={[salesperson.lat, salesperson.lng]}
                zoom={10}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                {filteredHistory.length > 0 && (
                    <>
                        <Polyline
                            positions={filteredHistory.map((h) => [h.lat, h.lng])}
                            color="#0077FF"
                            weight={4}
                        />
                        <Marker
                            position={[filteredHistory[0].lat, filteredHistory[0].lng]}
                            icon={defaultIcon}
                        >
                            <Tooltip direction="top" permanent>
                                Begin
                            </Tooltip>
                        </Marker>

                        <Marker
                            position={[
                                filteredHistory[filteredHistory.length - 1].lat,
                                filteredHistory[filteredHistory.length - 1].lng,
                            ]}
                            icon={defaultIcon}
                        >
                            <Tooltip direction="top" permanent>
                                End
                            </Tooltip>
                        </Marker>
                    </>
                )}
            </MapContainer>
        </div>
    );
}
