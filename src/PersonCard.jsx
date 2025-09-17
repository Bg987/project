import React, { useEffect, useState } from "react";
import { useSalesData } from "./SalesDataContext";

export default function PersonCard({ person, onClose }) {
  const { salespersons } = useSalesData();
  const [locationName, setLocationName] = useState("");

  // Get the latest data for this person from context
  const updatedPerson = salespersons.find((sp) => sp.id === person.id);
  if (!updatedPerson) return null;

  const lastHistory = updatedPerson.history[updatedPerson.history.length - 1];
  const lastUpdated = new Date(lastHistory.time);
  const now = new Date();
  const secondsAgo = Math.floor((now - lastUpdated) / 1000);

  // fetch location in human readable form
  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${updatedPerson.lat}&lon=${updatedPerson.lng}&format=json`
        );
        const data = await response.json();
        setLocationName(data.display_name);
      } catch (error) {
        console.error("Failed to fetch location name:", error);
        setLocationName(""); // fallback
      }
    }
    fetchLocation();
  }, [updatedPerson.lat, updatedPerson.lng]);//call as lat and lon change

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#1E1E2F",
          color: "#fff",
          padding: "25px",
          borderRadius: "12px",
          width: "450px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Close button at top-left */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Close
        </button>

        <img
          src={updatedPerson.image}
          alt={updatedPerson.name}
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "20px",
            border: "3px solid #fff",
          }}
        />

        <h2 style={{ margin: "5px 0" }}>
          {updatedPerson.name} {updatedPerson.Lname || ""}
        </h2>

        <p><b>Designation:</b> {updatedPerson.designation}</p>
        <p><b>Branch:</b> {updatedPerson.branch}</p>
        <p>
          <b>{secondsAgo === 0 ? "Current" : "Last"} Location:</b>{" "}
          {locationName || `(${updatedPerson.lat.toFixed(4)}, ${updatedPerson.lng.toFixed(4)})`}
        </p>
        <p>
          <b>Last Updated:</b> {lastUpdated.toLocaleString()} ({secondsAgo} seconds ago)
        </p>
      </div>
    </div>
  );
}
