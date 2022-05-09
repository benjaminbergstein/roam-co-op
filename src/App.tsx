import Map from "./Map";
import { GoogleProvider } from "./useGoogle";
const center = { lng: 39.7628, lat: -105.0263 };
const zoom = 4;

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
