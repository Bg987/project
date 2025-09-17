import { createContext, useContext, useState, useEffect } from "react";

const SalesDataContext = createContext();

// Initial positions
const initialSalespersons = [
  { id: 1, name: "Raj", lat: 23.0225, lng: 72.5714 },
  { id: 2, name: "Harsh", lat: 19.076, lng: 72.8777 },
  { id: 3, name: "Chandani", lat: 28.7041, lng: 77.1025 },
  { id: 4, name: "HK", lat: 22.3039, lng: 70.8022 },
];

// Helper: generate random walk history
function generateHistory(lat, lng, startHour = 9, endHour = 12) {
  const history = [];
  let currentLat = lat;
  let currentLng = lng;

  const intervalMinutes = 5;

  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      currentLat += (Math.random() - 0.5) * 0.01;
      currentLng += (Math.random() - 0.5) * 0.01;

      const time = new Date();
      time.setHours(h, m, 0, 0);

      history.push({ lat: currentLat, lng: currentLng, time });
    }
  }

  // Return object with last position as current lat/lng and full history
  return { lat: currentLat, lng: currentLng, history };
}

export function SalesDataProvider({ children }) {
  // Prepopulate salespersons with history and current position
  const [salespersons, setSalespersons] = useState(() =>
    initialSalespersons.map((sp) => {
      const generated = generateHistory(sp.lat, sp.lng);
      return {
        id: sp.id,
        name: sp.name,
        lat: generated.lat,
        lng: generated.lng,
        history: generated.history,
      };
    })
  );

  // Live update every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSalespersons((prev) =>
        prev.map((sp) => {
          const newLat = sp.lat + (Math.random() - 0.05) * 0.01;
          const newLng = sp.lng + (Math.random() - 0.05) * 0.01;
          return {
            ...sp,
            lat: newLat,
            lng: newLng,
            history: [
              ...sp.history,
              { lat: newLat, lng: newLng, time: new Date() },
            ],
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SalesDataContext.Provider value={{ salespersons, setSalespersons }}>
      {children}
    </SalesDataContext.Provider>
  );
}

export function useSalesData() {
  return useContext(SalesDataContext);
}
