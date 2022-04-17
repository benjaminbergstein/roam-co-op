import { useRef, useEffect, useState } from "react";
import json from "./data.json";
import { format } from "date-fns";
import ReactDOM from "react-dom";
import MapOverlay from "./MapOverlay";
import { rejects } from "assert";

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

type Event = {
  start: string;
  end: string;
  location: string;
  summary: string;
  type: string;
  position?: { lat: number; lng: number };
};
const events = Object.values(json) as Event[];

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
        style={{
          display: "flex",
          order: format(new Date(event.start), "yyyyMMdd"),
          borderLeft: "4px solid blue",
          marginLeft: "30px",
          alignItems: "center",
          padding: "10px",
          cursor: "pointer",
          background: isShowing ? "#efefef" : "transparent",
        }}
      >
        <div>
          <div
            style={{
              background: "blue",
              position: "relative",
              left: "-24px",
              height: "25px",
              width: "25px",
              borderRadius: "25px",
            }}
          ></div>
        </div>
        <div>
          <div>{event.summary}</div>
          <div>
            {format(new Date(event.start), "MMM do")} -{" "}
            {format(new Date(event.end), "MMM do")}
          </div>
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
              style={{
                backgroundColor: isShowing ? "red" : "blue",
                height: isShowing ? "15px" : "10px",
                width: isShowing ? "15px" : "10px",
                borderRadius: "10px",
              }}
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
            setTimeout(() => {
              geocoderRef.current.geocode(
                { address: obj.location },
                (results: any, status: any) => {
                  if (status !== "OK") {
                    console.group("Unable to geocode event");
                    console.log(status);
                    console.table(obj);
                    console.groupEnd();
                    res();
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
            }, idx * 100);
          })
      )
    ).then(() => {
      setEventData(newEventData);
    });
  }, [scriptLoaded]);

  if (!scriptLoaded) return null;

  return (
    <div style={{ display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "40%" }}>
        {eventData &&
          eventData.map((event) => (
            <Component key={JSON.stringify(event)} event={event} map={map} />
          ))}
      </div>
      <div ref={mapElRef} style={{ height: "100vh", width: "100%" }}></div>
    </div>
  );
}
