import { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSalesData } from "./SalesDataContext";
import SalesPersonDetail from "./SalesPersonDetail"; // New component

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SalesMap() {
  const { salespersons } = useSalesData();
  const [selectedPerson, setSelectedPerson] = useState(null); // Track clicked person

  // If a person is selected, show detail component
  if (selectedPerson) {
    return (
      <SalesPersonDetail
        salesperson={selectedPerson}
        onBack={() => setSelectedPerson(null)}
      />
    );
  }

  return (
    <MapContainer
      center={[23.0225, 72.5714]}
      zoom={5}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {salespersons.map((sp) => (
        <Marker
          key={sp.id}
          position={[sp.lat, sp.lng]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => setSelectedPerson(sp), // Open detail on click
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            {sp.name}
          </Tooltip>
          <Popup>
            <b>{sp.name}</b> <br />
            Lat: {sp.lat.toFixed(3)} <br />
            Lng: {sp.lng.toFixed(3)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
