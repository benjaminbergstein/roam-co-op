import { useRef, useEffect, useState, FC, MutableRefObject } from "react";
import { format, isBefore } from "date-fns";
import MapOverlay from "../MapOverlay";
import { ColorConfig, Coordinate, Event, EventStateType } from "../types";
import * as bookingLinks from "../bookingLinks";
import { FaCheck, FaQuestionCircle } from "react-icons/fa";
import DayCircle from "./DayCircle";
import geocode from "../geocode";
import useSWR from "swr";
import useGoogle from "../useGoogle";

type Props = {
  event: Event;
  boundsRef: MutableRefObject<google.maps.LatLngBounds | null>;
};

const colorConfig: Record<EventStateType, ColorConfig> = {
  past: {
    border: "border-stone-500",
    borderHover: "border-stone-500",
    bg: "bg-stone-500",
    bgHover: "bg-stone-500",
  },
  ongoing: {
    border: "border-amber-700",
    borderHover: "border-amber-300",
    bg: "bg-amber-700",
    bgHover: "bg-amber-300",
  },
  future: {
    border: "border-emerald-700",
    borderHover: "border-emerald-300",
    bg: "bg-emerald-700",
    bgHover: "bg-emerald-300",
  },
};

const EventCard: FC<Props> = ({ event, boundsRef }) => {
  const [isShowing, setShowing] = useState<boolean>(false);
  const { googlePromise, map } = useGoogle();
  const divRef = useRef<HTMLDivElement>(null);
  const { data: position } = useSWR<Coordinate>(
    `coordinate:${event.location}`,
    async () => {
      const google = await googlePromise;
      const geocoder = new google.maps.Geocoder();
      return await geocode(geocoder, event.location);
    },
    {
      errorRetryInterval: 1000,
    }
  );

  const isSmall = window.innerWidth < 400;
  useEffect(() => {
    if (!position) return;
    if (!map) return;
    if (!boundsRef.current) return;
    boundsRef.current.extend(position);
    map.fitBounds(
      boundsRef.current,
      isSmall ? { bottom: 300 } : { left: window.innerWidth / 3 }
    );
  }, [position]);

  const isPast = isBefore(new Date(event.end), new Date());
  const isStarted = isBefore(new Date(event.start), new Date());
  const isOngoing = isStarted && !isPast;

  const state = isPast ? "past" : isStarted ? "ongoing" : "future";
  const config = colorConfig[state];

  useEffect(() => {
    if (!isShowing) return;
    if (!divRef.current) return;
    divRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isShowing]);
  if (!position) return null;

  return (
    <>
      <div
        ref={divRef}
        onMouseEnter={() => {
          setShowing(true);
        }}
        onMouseLeave={() => {
          setShowing(false);
        }}
        className={`flex items-center bg-white ${
          isShowing ? `z-50  ${config.borderHover}` : `z-0 ${config.border}`
        } relative border-l-4 border-dashed ml-[15px] py-2 pl-[30px] cursor-pointer`}
        style={{
          order: format(
            isStarted && !isPast ? new Date() : new Date(event.start),
            "yyyyMMdd"
          ),
        }}
      >
        <DayCircle
          state={state}
          isShowing={isShowing}
          config={config}
          start={event.start}
        />
        <div>
          <div className="text-sm font-semibold">{event.summary}</div>
          {isShowing && (
            <div
              className={`absolute border-dashed border-l-4 border-b-4 ${config.borderHover} rounded-b-lg p-2 -left-[4px] top-full bg-white flex flex-col gap-2 shadow-xl w-full`}
            >
              <div className="text-xs">
                {format(new Date(event.start), "MMM do")} -{" "}
                {format(new Date(event.end), "MMM do")}
              </div>
              <div>
                {event.attendee &&
                  (Array.isArray(event.attendee)
                    ? event.attendee
                    : [event.attendee]
                  ).map(({ val, params }) => (
                    <div className="flex text-xs text-slate-900">
                      <div className="flex items-center justify-center w-6">
                        {params.PARTSTAT === "ACCEPTED" ? (
                          <FaCheck style={{ color: "green" }} />
                        ) : (
                          <FaQuestionCircle style={{ color: "orange" }} />
                        )}
                      </div>
                      <div>{val.split(":")[1]}</div>
                    </div>
                  ))}
              </div>
              {(!isStarted || !isPast) && (
                <>
                  <div className="text-sm">Book on:</div>
                  <div>
                    <a
                      className="text-sky-600 text-sm"
                      href={bookingLinks.hipcamp(event)}
                      target="_BLANK"
                    >
                      Hipcamp
                    </a>
                  </div>
                  <div>
                    <a
                      className="text-sky-600 text-sm"
                      href={bookingLinks.airbnb(event)}
                      target="_BLANK"
                    >
                      Airbnb
                    </a>
                  </div>
                  <div>
                    <a
                      className="text-sky-600 text-sm"
                      href={bookingLinks.vrbo(event)}
                      target="_BLANK"
                    >
                      VRBO
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <MapOverlay map={map} position={position}>
        <div
          onMouseEnter={() => setShowing(true)}
          onMouseLeave={() => setShowing(false)}
        >
          <div className="flex cursor-pointer items-center justify-center h-[10px] w-[10px] -my-[5px] md:h-[26px] md:w-[26px] md:-my-[13px]">
            <div
              className={`border-white border-2 ${
                isShowing
                  ? `${config.bgHover} w-[15px] h-[15px]`
                  : `${config.bg} w-[10px] h-[10px]`
              } rounded-xl`}
            ></div>
          </div>
        </div>
      </MapOverlay>
    </>
  );
};

export default EventCard;
