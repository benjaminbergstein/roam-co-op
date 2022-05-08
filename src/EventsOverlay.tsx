import { useEffect, useRef } from "react";
import useCalendarEvents from "./useCalendarEvents";
import useGoogle from "./useGoogle";
import { FaSpinner } from "react-icons/fa";
import EventCard from "./EventCard";
import { format, isPast, isThisMonth } from "date-fns";
import useCurrentUser from "./useCurrentUser";
import { RiGoogleFill } from "react-icons/ri";
import { FaLink } from "react-icons/fa";
import useSWR from "swr";

const EventsOverlay = () => {
  const { map } = useGoogle();
  const { events, months } = useCalendarEvents();
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

  const { api, authorized, isValidating, data: me } = useCurrentUser();
  const email = me?.email;
  const { data: shares } = useSWR<Array<ShareType>>(
    email ? `${email}:shareLinks` : null,
    async () => api("/api/shares")
  );
  const createShareLink = async () => {
    await api("/api/shares", { method: "POST" });
  };

  const shareLink = shares && shares[0];

  useEffect(() => {
    if (!authorized) return;
    if (!email) return;
    if (shareLink) return;
    createShareLink();
  }, [shareLink]);

  const isDev = window.location.hostname === "localhost";

  useEffect(() => {
    if (!map) return;
    boundsRef.current = new google.maps.LatLngBounds();
  }, [map]);

  return (
    <div className="fixed bottom-0 left-0 z-50 h-0">
      <div className="absolute bottom-0 left-0">
        <div className="absolute flex w-full bottom-0 left-[2vw] w-[95vw] md:w-[40vw] md:max-w-[500px] md:h-[95vh] h-[50vh] py-5">
          <div className="flex-1 bg-white flex flex-col overflow-y-auto rounded-md px-2 shadow-lg">
            {!authorized && !isValidating && (
              <div className="h-full flex justify-center flex-col px-2">
                <div className="flex flex-col gap-1 lg:gap-2">
                  <h1 className="text-2xl text-zinc-800 my-1 lg:my-3">
                    Plan adventures <span className="italic">together</span> 💞
                  </h1>
                  <h2 className="text-sm text-zinc-600 my-3">
                    Connect Google to visualize your calendar plans and create a
                    map.
                  </h2>
                  <a
                    href={`${
                      isDev ? "http://localhost:8788" : ""
                    }/oauth/redirect`}
                  >
                    <button className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                      <RiGoogleFill /> Connect Google
                    </button>
                  </a>
                </div>
              </div>
            )}
            {!events && isValidating && (
              <div className="flex justify-center items-center w-full gap-4 p-4">
                <FaSpinner className="animate-spin" />
                <div>Loading...</div>
              </div>
            )}
            {months &&
              months.map((date) => (
                <div
                  className={`${
                    isThisMonth(date)
                      ? "border-amber-700 text-amber-900"
                      : isPast(date)
                      ? "border-stone-700 text-stone-900"
                      : "border-emerald-700 text-emerald-900"
                  } border-l-4 border-dashed ml-[15px] pl-[30px] cursor-pointer text-[0.6em] font-bold uppercase`}
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
            {shareLink && (
              <div className="text-xs text-sky-500 order-[99999999]">
                <a
                  href={shareLink.url}
                  className="flex items-center gap-2 mx-1 my-3"
                >
                  <FaLink />
                  Shareable link
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsOverlay;
