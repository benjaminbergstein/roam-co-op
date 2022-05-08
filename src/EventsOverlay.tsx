import { useEffect, useRef } from "react";
import useCalendarEvents from "./useCalendarEvents";
import useGoogle from "./useGoogle";
import { FaSpinner } from "react-icons/fa";
import EventCard from "./EventCard";
import { format } from "date-fns";

const EventsOverlay = () => {
  const { map } = useGoogle();
  const { events, months } = useCalendarEvents();
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

  useEffect(() => {
    if (!map) return;
    boundsRef.current = new google.maps.LatLngBounds();
  }, [map]);

  return (
    <div className="fixed bottom-0 left-0 z-50 h-0">
      <div className="absolute bottom-0 left-0">
        <div className="absolute flex w-full bottom-0 left-[2vw] w-[95vw] md:w-[40vw] md:max-w-[500px] md:h-[95vh] h-[50vh] py-5">
          <div className="flex-1 bg-white flex flex-col overflow-y-auto rounded-md px-2 shadow-lg">
            {!events && (
              <div className="flex justify-center items-center w-full gap-4 p-4">
                <FaSpinner className="animate-spin" />
                <div>Loading...</div>
              </div>
            )}
            {months &&
              months.map((date) => (
                <div
                  className={`border-emerald-700 border-l-4 border-dashed ml-[15px] pl-[30px] cursor-pointer text-[0.6em] font-bold uppercase text-emerald-900`}
                  style={{ order: `${format(date, "yyyyMM")}00` }}
                >
                  <div className="opacity-70 tracking-widest h-[40px] flex items-center">
                    {format(date, "MMMM yyyy")}
                  </div>
                </div>
              ))}
            {map &&
              events &&
              events?.map((event, idx) => (
                <EventCard
                  key={JSON.stringify(event)}
                  event={event}
                  boundsRef={boundsRef}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsOverlay;
