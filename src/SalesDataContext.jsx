import { createContext, useContext, useState, useEffect } from "react";
import rajI from "./assets/DP/raj.png";
import harshI from "./assets/DP/harsh.png";
import hkI from "./assets/DP/HK.png";
import chI from "./assets/DP/chandani.jpg";
const SalesDataContext = createContext();

// Initial positions
const initialSalespersons = [
  { id: 1, name: "Raj",Lname: "Hakani", lat: 23.0225, lng: 72.5714,image : rajI,designation: "Sales Manager", branch: "Ahmedabad"  },
  { id: 2, name: "Harsh",Lname: "Majethiya", lat: 19.076, lng: 72.8777,image : harshI ,designation: "Sales Executive", branch: "Mumbai"  },
  { id: 3, name: "Chandani",Lname: "Sharma", lat: 28.7041, lng: 77.1025,image : chI ,designation: "Sales Associate", branch: "Delhi"  },
  { id: 4, name: "Het",Lname: "Rakholiya", lat: 22.3039, lng: 70.8022 ,image : hkI,designation: "Regional Sales Head", branch: "Rajkot"  },
];

// Helper: generate random walk history
function generateHistory(lat, lng, startHour = 8, endHour = 12) {
  const history = [];
  let currentLat = lat;
  let currentLng = lng;

  const intervalMinutes = 1;

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
      ...sp,
      lat: generated.lat,
      lng: generated.lng,
      history: generated.history,
      lastUpdateTime: new Date(), // track last "real" update
    };
  })
);

useEffect(() => {
  const interval = setInterval(() => {
    setSalespersons((prev) =>
      prev.map((sp) => {
        // Randomly decide whether to update
        const shouldUpdate = Math.random() < 0.5; // 50% chance update to mimic sometimes no movement
        if (!shouldUpdate) return sp;

        const newLat = sp.lat + (Math.random() - 0.5) * 0.01;
        const newLng = sp.lng + (Math.random() - 0.5) * 0.01;
        return {
          ...sp,
          lat: newLat,
          lng: newLng,
          history: [...sp.history, { lat: newLat, lng: newLng, time: new Date() }],
          lastUpdateTime: new Date(), // update lastUpdateTime 
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
