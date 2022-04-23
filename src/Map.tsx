import { useRef, useEffect, useState } from "react";
import json from "./data.json";
import { format } from "date-fns";
import MapOverlay from "./MapOverlay";
import { FaCheck, FaQuestionCircle, FaSpinner } from "react-icons/fa";

const center = {
  lat: 59.95,
  lng: 30.33,
};
const zoom = 11;

const getGoogle = (prop: string): any => {
  return (window as any).google[prop];
};

const newGoogle = (type: string, ...options: any) => {
  const google = (window as any).google;
  return new google.maps[type](...options);
};

const apiKey = "AIzaSyA8NjQqq03V3wwueUV_EV6nfGwUF5YAfAY";

type Attendee = {
  val: string;
  params: {
    PARTSTAT: string;
  };
};

type Event = {
  start: string;
  end: string;
  location: string;
  summary: string;
  type: string;
  position?: { lat: number; lng: number };
  attendee: Attendee[];
};
const events = Object.values(json) as Event[];

const queryString = (params: Record<string, string | number>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    searchParams.append(k, v.toString());
  });
  return searchParams.toString();
};

const hipcampLink = (event: Event) =>
  event.position &&
  `https://www.hipcamp.com/en-US/search/group-2?${queryString({
    arrive: format(new Date(event.start), "yyyy-MM-dd"),
    depart: format(new Date(event.end), "yyyy-MM-dd"),
    adults: 2,
    pets: 1,
    children: 0,
    q: event.location,
    ...event.position,
  })}`;

const airbnbLink = (event: Event) =>
  event.position &&
  `https://www.airbnb.com/s/homes?${queryString({
    query: event.location,
    checkin: format(new Date(event.start), "yyyy-MM-dd"),
    checkout: format(new Date(event.end), "yyyy-MM-dd"),
    pets: 1,
    adults: 2,
  })}`;

const bookingLink = (event: Event) =>
  event.position &&
  `https://www.booking.com/searchresults.html?${queryString({
    label:
      "gog235jc-1DCAEYrwIoggI46AdIM1gDaLECiAEBmAExuAEHyAEM2AED6AEB-AECiAIBqAIDuALCmY6TBsACAdICJGVlNTVjOGE1LTlmYTQtNDVmOC04ZWU3LTlkMzJkZmM1NDczOdgCBOACAQ",
    sid: "5fcc60e704516457350ee8e8f7cbfba8",
    aid: 397594,
    sb_lp: 1,
    src: "index",
    ss: event.location,
    ssne: event.location,
    ssne_untouched: event.location,
    checkin_year: format(new Date(event.start), "yyyy"),
    checkin_month: format(new Date(event.start), "MM"),
    checkin_monthday: format(new Date(event.start), "d"),
    checkout_year: format(new Date(event.end), "yyyy"),
    checkout_month: format(new Date(event.end), "MM"),
    checkout_monthday: format(new Date(event.end), "d"),
    group_adults: 5,
    group_children: 0,
  })}`;

const vrboLink = (event: Event) =>
  event.position &&
  `https://www.vrbo.com/search/keywords:${event.location
    .replace(/\s/g, "-")
    .replace(/[^a-zA-Z\-]/g, "")}/arrival:${format(
    new Date(event.start),
    "yyyy-MM-dd"
  )}/departure:${format(
    new Date(event.end),
    "yyyy-MM-dd"
  )}/filter:27?adultsCount=2&petIncluded=true`;

const Component = ({ map, event }: { map: any; event: Event }) => {
  const [isShowing, setShowing] = useState<boolean>(false);
  const matches = event.location?.match(/^[\w ]{1,}, \w{2}/);
  const city = matches && matches.length > 0 ? matches[0] : "";

  if (event.type !== "VEVENT") return null;
  if (!event.position) return null;

  return (
    <>
      <div
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
              event.attendee.map(({ val, params }) => (
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
                  href={hipcampLink(event)}
                  target="_BLANK"
                >
                  Hipcamp
                </a>
              </div>
              <div>
                <a
                  className="text-sky-600 text-sm"
                  href={airbnbLink(event)}
                  target="_BLANK"
                >
                  Airbnb
                </a>
              </div>
              <div>
                <a
                  className="text-sky-600 text-sm"
                  href={vrboLink(event)}
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

export default function Map() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const geocoderRef = useRef<any | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [eventData, setEventData] = useState<Event[] | undefined>(undefined);

  useEffect(() => {
    if (scriptRef.current) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.setAttribute("defer", "");
    script.onload = () => {
      setScriptLoaded(true);
    };
    scriptRef.current = script;
    document.body.append(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;
    geocoderRef.current = newGoogle("Geocoder");
    const map = newGoogle("Map", mapElRef.current, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
    setMap(map);
    const bounds = newGoogle("LatLngBounds");

    const newEventData: Event[] = [];
    Promise.all(
      Object.values(json).map(
        async (obj: any, idx: number) =>
          new Promise<void>((res, rej) => {
            if (obj.type !== "VEVENT") {
              res();
              return;
            }
            let tries = 0;
            const geocode = () => {
              setTimeout(() => {
                geocoderRef.current.geocode(
                  { address: obj.location },
                  (results: any, status: any) => {
                    if (
                      status !== "OK" &&
                      (status !== "OVER_QUERY_LIMIT" || tries === 5)
                    ) {
                      console.group("Unable to geocode event");
                      console.log(status);
                      console.table(obj);
                      console.groupEnd();
                      res();
                      return;
                    } else if (status === "OVER_QUERY_LIMIT") {
                      tries = tries + 1;
                      console.log(tries);
                      geocode();
                      return;
                    }
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    obj.position = { lat, lng };
                    newEventData.push(obj);
                    bounds.extend({ lat, lng });
                    map.fitBounds(bounds);
                    res();
                  }
                );
              }, idx * 100 + tries * 150);
            };
            geocode();
          })
      )
    ).then(() => {
      setEventData(newEventData);
    });
  }, [scriptLoaded]);

  if (!scriptLoaded) return null;

  return (
    <div style={{ display: "flex" }}>
      <div className="flex flex-col w-2/5 min-w-[400px] h-screen overflow-y-auto pb-12">
        {!eventData && (
          <div className="flex justify-center items-center w-full gap-4 p-4">
            <FaSpinner className="animate-spin" />
            <div>Loading...</div>
          </div>
        )}
        {eventData &&
          eventData?.map((event) => (
            <Component key={JSON.stringify(event)} event={event} map={map} />
          ))}
      </div>
      <div ref={mapElRef} style={{ height: "100vh", width: "100%" }}></div>
    </div>
  );
}
