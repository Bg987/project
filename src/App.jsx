import { SalesDataProvider } from "./SalesDataContext";
import SalesMap from "./SalesMap";

function App() {
  return (
    <SalesDataProvider>
      <div>
        <h2 style={{ textAlign: "center" }}>Project</h2>
        <SalesMap />
      </div>
    </SalesDataProvider>
  );
}

export default App;
