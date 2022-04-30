import { FaSpinner } from "react-icons/fa";
import useGoogle from "./useGoogle";
import EventCard from "./EventCard";
import useCalendarEvents from "./useCalendarEvents";

export default function Map() {
  const { google, map, mapRef, loading } = useGoogle();
  const eventData = useCalendarEvents();

  if (!google) return null;

  return (
    <div style={{ display: "flex" }}>
      <div className="flex flex-col w-2/5 min-w-[400px] h-screen overflow-y-auto pb-12">
        {!eventData && (
          <div className="flex justify-center items-center w-full gap-4 p-4">
            <FaSpinner className="animate-spin" />
            <div>Loading...</div>
          </div>
        )}
        {map &&
          eventData &&
          eventData?.map((event) => (
            <EventCard key={JSON.stringify(event)} event={event} map={map} />
          ))}
      </div>
      <div ref={mapRef} style={{ height: "100vh", width: "100%" }}></div>
    </div>
  );
}
