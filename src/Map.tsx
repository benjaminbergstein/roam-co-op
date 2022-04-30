import useGoogle from "./useGoogle";
import EventsOverlay from "./EventsOverlay";

export default function Map() {
  const { mapRef } = useGoogle();

  return (
    <div className="h-[98vh]">
      <EventsOverlay />
      <div ref={mapRef} className="h-full w-full"></div>
    </div>
  );
}
