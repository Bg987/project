import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSalesData } from "./SalesDataContext";
import PersonCard from "./PersonCard";
import SalesPersonDetail from "./SalesPersonDetail";

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

  const [selectedPersonCard, setSelectedPersonCard] = useState(null); // marker click
  const [selectedPersonDetail, setSelectedPersonDetail] = useState(null); // menu click
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterDesignation, setFilterDesignation] = useState("All");

  const filteredSalespersons = salespersons.filter((sp) => {
    const branchMatch = filterBranch === "All" || sp.branch === filterBranch;
    const desigMatch = filterDesignation === "All" || sp.designation === filterDesignation;
    return branchMatch && desigMatch;
  });

  const branches = ["All", ...new Set(salespersons.map((sp) => sp.branch))];
  const designations = ["All", ...new Set(salespersons.map((sp) => sp.designation))];

  const markers = useMemo(() => {
    const now = new Date();
    return filteredSalespersons.map((sp) => {
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
            click: () => setSelectedPersonCard(sp),
          }}
        />
      );
    });
  }, [filteredSalespersons]);

  if (selectedPersonDetail) {
    return (
      <SalesPersonDetail
        salesperson={selectedPersonDetail}
        onBack={() => setSelectedPersonDetail(null)}
      />
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="filters-bar">
        <label>
          Branch:
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label>
          Designation:
          <select value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)}>
            {designations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {/* Salesperson List */}
      <div className="salesperson-list">
        {filteredSalespersons.map((sp) => (
          <div
            key={sp.id}
            onClick={() => setSelectedPersonDetail(sp)}
            className={`salesperson-item ${selectedPersonDetail?.id === sp.id ? "active" : ""}`}
          >
            <img src={sp.image} alt={sp.name} />
            <div className="info">
              <b>{sp.name} {sp.Lname}</b>
              <div className="branch">{sp.branch}</div>
              <div className="designation">{sp.designation}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <MapContainer center={[23.0225, 72.5714]} zoom={5} style={{ height: "100vh", width: "100vw" }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {markers}
      </MapContainer>

      {/* PersonCard */}
      {selectedPersonCard && (
        <PersonCard
          person={selectedPersonCard}
          onClose={() => setSelectedPersonCard(null)}
        />
      )}

      {/* Styles */}
      <style jsx>{`
        .filters-bar {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: #1E1E2F;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }

        .salesperson-list {
          position: absolute;
          top: 70px;
          left: 10px;
          color : black;
          z-index: 1000;
          max-height: 60vh;
          overflow-y: auto;
          background: #fff;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          min-width: 220px;
        }

        .salesperson-item {
          display: flex;
          align-items: center;
          padding: 8px;
          margin-bottom: 5px;
          cursor: pointer;
          color : black;
          border-radius: 6px;
          background: #f0f0f0;
        }

        .salesperson-item.active {
          background: #0077FF;
          color: white;
        }

        .salesperson-item img {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 10px;
          border: 2px solid #fff;
        }

        .salesperson-item .branch {
          font-size: 0.9rem;
        }

        .salesperson-item .designation {
          font-size: 0.8rem;
          color: #555;
        }
        @media (max-width: 768px) {
          .filters-bar {
            top: auto;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            flex-direction: column;
            width: 90%;
            font-size: 14px;
          }

          .salesperson-list {
            top: auto;
            bottom: 80px;
            color : black;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-height: 30vh;
          }

          .salesperson-item {
            font-size: 14px;
          }

          .salesperson-item img {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
}
