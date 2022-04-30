import { useRef, useState, useEffect } from "react";
import { Event } from "./types";
import useGoogle from "./useGoogle";
import json from "./data.json";
import geocode from "./geocode";
import { min, max, eachMonthOfInterval } from "date-fns";

type UseCalendarEventsReturn = {
  events?: Event[];
  months?: Array<Date>;
};

const getMonths = (data?: Event[]): Array<Date> | undefined => {
  if (!data) return undefined;

  const [minDate, maxDate] = data.reduce<[Date, Date]>((acc, e) => {
    const startDate = new Date(e.start);
    const endDate = new Date(e.end);
    return [
      min([...acc, startDate, endDate]),
      max([...acc, startDate, endDate]),
    ];
  }, [] as unknown as [Date, Date]) as [Date, Date];

  return eachMonthOfInterval({ start: minDate, end: maxDate });
};

const useCalendarEvents = (): UseCalendarEventsReturn => {
  const { google, map } = useGoogle();
  const startedProcessingDataAtRef = useRef<number | null>(null);
  const [data, setData] = useState<Event[] | undefined>(undefined);

  const geocoder = google && new google.maps.Geocoder();
  const months = getMonths(data);

  useEffect(() => {
    if (!google) return;
    if (!map) return;
    if (!geocoder) return;
    if (data) return;
    if (startedProcessingDataAtRef.current) return;

    startedProcessingDataAtRef.current = +new Date();
    const bounds = new google.maps.LatLngBounds();

    const newEventData: Event[] = [];
    const isSmall = window.innerWidth < 400;

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
                  map.fitBounds(
                    bounds,
                    isSmall ? { bottom: 300 } : { left: window.innerWidth / 3 }
                  );
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

  return {
    events: data,
    months,
  };
};

export default useCalendarEvents;
