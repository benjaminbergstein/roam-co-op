import { useRef, useEffect, useState, FC } from "react";
import { format } from "date-fns";
import MapOverlay from "../MapOverlay";
import { Event } from "../types";
import * as bookingLinks from "../bookingLinks";
import { FaCheck, FaQuestionCircle } from "react-icons/fa";
import DayCircle from "./DayCircle";

type Props = {
  map: google.maps.Map;
  event: Event;
};

const EventCard: FC<Props> = ({ map, event }) => {
  const [isShowing, setShowing] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const matches = event.location?.match(/^[\w ]{1,}, \w{2}/);
  const city = matches && matches.length > 0 ? matches[0] : "";

  const startMonth = format(new Date(event.start), "MMM");
  const endMonth = format(new Date(event.end), "MMM");
  const monthChanged = startMonth !== endMonth;

  useEffect(() => {
    if (!isShowing) return;
    if (!divRef.current) return;
    divRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isShowing]);
  if (event.type !== "VEVENT") return null;
  if (!event.position) return null;

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
          isShowing ? "z-50 border-emerald-300" : "z-0 border-emerald-700"
        } relative border-l-4 border-dashed ml-[15px] py-2 pl-[30px] cursor-pointer`}
        style={{
          order: format(new Date(event.start), "yyyyMMdd"),
        }}
      >
        <DayCircle isShowing={isShowing} start={event.start} />
        <div>
          <div className="text-sm font-semibold">{event.summary}</div>
          {isShowing && (
            <div className="absolute border-dashed border-l-4 border-b-4 border-emerald-300 rounded-b-lg p-2 -left-[4px] top-full bg-white flex flex-col gap-2 shadow-xl w-full">
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
            </div>
          )}
        </div>
      </div>
      <MapOverlay map={map} position={event.position}>
        <div
          onMouseEnter={() => setShowing(true)}
          onMouseLeave={() => setShowing(false)}
        >
          <div className="flex cursor-pointer items-center justify-center h-[10px] w-[10px] -my-[5px] md:h-[26px] md:w-[26px] md:-my-[13px]">
            <div
              className={`border-white border-2 ${
                isShowing
                  ? "bg-emerald-300 w-[15px] h-[15px]"
                  : "bg-emerald-700 w-[10px] h-[10px]"
              } rounded-xl`}
            ></div>
          </div>
        </div>
      </MapOverlay>
    </>
  );
};

export default EventCard;
