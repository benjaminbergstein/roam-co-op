import { useRef, useState, useEffect } from "react";
import { Event } from "./types";
import useGoogle from "./useGoogle";
import json from "./data.json";
import geocode from "./geocode";

const useCalendarEvents = (): Event[] | undefined => {
  const { google, map } = useGoogle();
  const startedProcessingDataAtRef = useRef<number | null>(null);
  const [data, setData] = useState<Event[] | undefined>(undefined);

  const geocoder = google && new google.maps.Geocoder();

  useEffect(() => {
    if (!google) return;
    if (!map) return;
    if (!geocoder) return;
    if (data) return;
    if (startedProcessingDataAtRef.current) return;

    startedProcessingDataAtRef.current = +new Date();
    const bounds = new google.maps.LatLngBounds();

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
            const geocodeObj = () => {
              setTimeout(async () => {
                try {
                  const coordinate = await geocode(geocoder, obj.location);
                  obj.position = coordinate;
                  newEventData.push(obj);
                  bounds.extend(coordinate);
                  map.fitBounds(bounds);
                  res();
                } catch (e: any) {
                  console.log({ e });
                  if (e === "OVER_QUERY_LIMIT") {
                    if (tries === 5) {
                      console.group(`Unable to geocode event: ${e}`);
                      console.table(obj);
                      console.groupEnd();
                      res();
                    } else {
                      tries = tries + 1;
                      console.log(tries);
                      geocodeObj();
                    }
                  } else {
                    console.error(e);
                    res();
                  }
                  return;
                }
              }, tries * 150);
            };
            geocodeObj();
          })
      )
    ).then(() => {
      setData(newEventData);
    });
  }, [google, map]);

  return data;
};

export default useCalendarEvents;
