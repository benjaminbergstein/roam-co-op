import Map from "./Map";
import "./App.css";
import { GoogleProvider } from "./useGoogle";
const center = { lat: -34.397, lng: 150.644 };
const zoom = 8;

function App() {
  return (
    <GoogleProvider {...{ center, zoom }}>
      <div>
        <Map />
      </div>
    </GoogleProvider>
  );
}

export default App;
