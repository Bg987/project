import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { useState, useRef, useEffect, useMemo } from "react";
import markerIcon from "leaflet/dist/images/marker-icon.png";

// 🔹 Define a default Leaflet icon for markers
const defaultIcon = L.icon({
  iconUrl: markerIcon,       // image URL for the marker
  iconSize: [25, 41],        // width and height
  iconAnchor: [12, 41],      // point of the icon which will correspond to marker's location
});

//  Function to convert a timestamp to "HH:MM" string
const getTimeString = (date) => {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, "0");  // hour with leading 0
  const m = String(d.getMinutes()).padStart(2, "0"); // minute with leading 0
  return `${h}:${m}`;
};

export default function SalesPersonDetail({ salesperson, onBack }) {
  // Extract times from salesperson history
  const times = salesperson.history.map((h) => getTimeString(h.time));

  //  Calculate min and max time from history to use as bounds
  const minTime = times.length > 0 ? times.reduce((a, b) => (a < b ? a : b)) : "00:00";
  const maxTime = times.length > 0 ? times.reduce((a, b) => (a > b ? a : b)) : "23:59";

  //  Component state
  const [startTime, setStartTime] = useState(minTime);   // filter start time
  const [endTime, setEndTime] = useState(maxTime);       // filter end time
  const [isPlaying, setIsPlaying] = useState(false);     // animation playing or paused
  const [speed, setSpeed] = useState(1);                 // animation speed

  //  References for animation
  const markerRef = useRef(null);       // reference to moving marker
  const animationRef = useRef(null);    // reference to animation frame
  const indexRef = useRef(0);           // current index of marker in filtered path
  const progressRef = useRef(0);        // progress between two points (0 to 1)
  const forwardRef = useRef(true);      // animation direction (forward/backward)

  //  Filter path based on selected start and end time
  const filteredPath = useMemo(() => {
    return salesperson.history.filter((p) => {
      const timeStr = getTimeString(p.time);
      const clampedStart = startTime < minTime ? minTime : startTime;
      const clampedEnd = endTime > maxTime ? maxTime : endTime;
      return timeStr >= clampedStart && timeStr <= clampedEnd;
    });
  }, [salesperson.history, startTime, endTime, minTime, maxTime]);

  //  Function to move the marker along the filtered path
  const moveMarker = () => {
    if (!isPlaying || filteredPath.length < 2) return;

    const fromIndex = indexRef.current;
    const toIndex = forwardRef.current ? fromIndex + 1 : fromIndex - 1;

    //  Stop if reached start or end
    if (toIndex < 0 || toIndex >= filteredPath.length) {
      setIsPlaying(false);
      return;
    }

    const from = filteredPath[fromIndex];
    const to = filteredPath[toIndex];
    const steps = 60 / speed; // controls smoothness based on speed

    //  Animate marker between two points
    const animate = () => {
      if (!isPlaying) return;

      progressRef.current += 1 / steps;
      if (progressRef.current > 1) progressRef.current = 1;

      const lat = from.lat + (to.lat - from.lat) * progressRef.current;
      const lng = from.lng + (to.lng - from.lng) * progressRef.current;

      // 🔹 Update marker position
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);

      if (progressRef.current < 1) {
        animationRef.current = requestAnimationFrame(animate); // continue animation
      } else {
        indexRef.current = toIndex;    // move to next point
        progressRef.current = 0;       // reset progress
        animationRef.current = requestAnimationFrame(moveMarker); // continue
      }
    };

    animate();
  };

  //  Effect to start/stop animation when isPlaying or speed changes
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(moveMarker);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, speed]);

  //  Reset marker if filtered path changes
  useEffect(() => {
    if (indexRef.current >= filteredPath.length) {
      indexRef.current = 0;
      progressRef.current = 0;
      if (markerRef.current && filteredPath[0]) {
        markerRef.current.setLatLng([filteredPath[0].lat, filteredPath[0].lng]);
      }
      setIsPlaying(false);
    }
  }, [filteredPath]);

  //  Start animation forward
  const handleForward = () => {
    if (filteredPath.length === 0) return;
    forwardRef.current = true;
    setIsPlaying(true);
  };

  //  Start animation backward
  const handleBackward = () => {
    if (filteredPath.length === 0) return;
    forwardRef.current = false;
    setIsPlaying(true);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
       <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1100,
          padding: "8px 12px",
          background: "#0077FF",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button>

       <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
        {salesperson.name}
      </div>

      <div
        style={{
          position: "absolute",
          top: 70,
          left: 20,
          zIndex: 1000,
          background: "white",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <label>Start Time:</label>
        <input
          type="time"
          value={startTime}
          min={minTime}
          max={maxTime}
          onChange={(e) => setStartTime(e.target.value)}
          step="60"
        />
        <label>End Time:</label>
        <input
          type="time"
          value={endTime}
          min={minTime}
          max={maxTime}
          onChange={(e) => setEndTime(e.target.value)}
          step="60"
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          display: "flex",
          gap: 10,
        }}
      >
        <button onClick={handleBackward}>⏮ Backward</button>
        <button onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={handleForward}>⏭ Forward</button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
        </select>
      </div>

      <MapContainer
        center={[filteredPath[0]?.lat || 0, filteredPath[0]?.lng || 0]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <Polyline positions={filteredPath.map((p) => [p.lat, p.lng])} color="#0077FF" />

        {filteredPath.length > 0 && (
          <Marker
            ref={markerRef}
            position={[
              filteredPath[indexRef.current]?.lat || 0,
              filteredPath[indexRef.current]?.lng || 0,
            ]}
            icon={defaultIcon}
          />
        )}

        {filteredPath.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={4}
            pathOptions={{ color: "red" }}
          >
            <Popup>
              <div>
                <b>Time:</b> {getTimeString(p.time)} <br />
                <b>Lat:</b> {p.lat.toFixed(4)} <br />
                <b>Lng:</b> {p.lng.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
