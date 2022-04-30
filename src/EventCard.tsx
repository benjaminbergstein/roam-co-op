import { useRef, useEffect, useState, FC } from "react";
import { format } from "date-fns";
import MapOverlay from "./MapOverlay";
import { Event } from "./types";
import * as bookingLinks from "./bookingLinks";
import { FaCheck, FaQuestionCircle, FaSpinner } from "react-icons/fa";

type Props = { map: google.maps.Map; event: Event };
const EventCard: FC<Props> = ({ map, event }) => {
  const [isShowing, setShowing] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const matches = event.location?.match(/^[\w ]{1,}, \w{2}/);
  const city = matches && matches.length > 0 ? matches[0] : "";

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
        className={`flex bg-white ${
          isShowing ? "z-50 border-rose-500" : "z-0 border-sky-500"
        } relative border-l-4 border-dashed ml-7 p-2.5 cursor-pointer`}
        style={{
          order: format(new Date(event.start), "yyyyMMdd"),
        }}
      >
        <div>
          <div
            className={`${
              isShowing ? "bg-rose-500" : "bg-sky-500"
            } relative -left-[32px] h-5 w-5 rounded-full`}
          ></div>
        </div>
        <div>
          <div>{event.summary}</div>
          <div>
            {format(new Date(event.start), "MMM do")} -{" "}
            {format(new Date(event.end), "MMM do")}
          </div>
          <div>
            {event.attendee &&
              (Array.isArray(event.attendee)
                ? event.attendee
                : [event.attendee]
              ).map(({ val, params }) => (
                <div className="flex text-sm text-slate-900">
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
          {isShowing && (
            <div className="absolute border-dashed border-l-4 border-b-4 border-rose-500 rounded-b-lg p-2 -left-[4px] top-full bg-white flex gap-2 items-center shadow-xl w-full">
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
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "26px",
              width: "26px",
              marginTop: "-13px",
              marginBottom: "-13px",
            }}
          >
            <div
              className={`${
                isShowing
                  ? "bg-rose-500 w-[15px] h-[15px]"
                  : "bg-sky-500 w-[10px] h-[10px]"
              } rounded-xl`}
            ></div>
          </div>
        </div>
      </MapOverlay>
    </>
  );
};

export default EventCard;
