import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSalesData } from "./SalesDataContext";
import PersonCard from "./PersonCard"; // Overlay card

// Create circular icon with dynamic border color
const createCircularIcon = (imageUrl, statusColor = "green") =>
  L.divIcon({
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          width: 45px;
          height: 45px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid ${statusColor};
          background: #fff;
          box-shadow: 0 0 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${imageUrl}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid ${statusColor};
          margin-top: -2px;
        "></div>
      </div>
    `,
    className: "",
    iconSize: [45, 55],
    iconAnchor: [22, 55],
    popupAnchor: [0, -55],
  });

export default function SalesMap() {
  const { salespersons } = useSalesData();
  const [selectedPerson, setSelectedPerson] = useState(null);

  // prevent calculation after every render 
  const markers = useMemo(() => {
    const now = new Date();

    return salespersons.map((sp) => {
      const lastHistory = sp.history[sp.history.length - 1];
      const lastUpdated = new Date(lastHistory.time);
      const secondsAgo = Math.floor((now - lastUpdated) / 1000);

      const statusColor = secondsAgo > 3 ? "red" : "green";

      return (
        <Marker
          key={sp.id}
          position={[sp.lat, sp.lng]}
          icon={createCircularIcon(sp.image, statusColor)}
          eventHandlers={{
            click: () => setSelectedPerson(sp),
          }}
        />
      );
    });
  }, [salespersons]);

  return (
    <>
      <MapContainer
        center={[23.0225, 72.5714]}
        zoom={5}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {markers}
      </MapContainer>

      {selectedPerson && (
        <PersonCard
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}
