import { useEffect } from "react";
import useSWR from "swr";
import { Event, GoogleType } from "./types";
import useGoogle from "./useGoogle";
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

const fetcher = async (
  googlePromise: Promise<GoogleType>
): Promise<Event[]> => {
  const res = await fetch("/roam-coop");
  const json = await res.json();

  return Promise.resolve(json);
};

const useCalendarEvents = (): UseCalendarEventsReturn => {
  const { google, googlePromise, map } = useGoogle();
  const { data } = useSWR<Event[]>("eventData", async () =>
    fetcher(googlePromise)
  );

  const months = getMonths(data);

  useEffect(() => {
    if (!(google && map && data)) return;

    const isSmall = window.innerWidth < 400;
    const bounds = new google.maps.LatLngBounds();
    data.forEach(({ position }) => {
      if (!position) return;
      bounds.extend(position);
      map.fitBounds(
        bounds,
        isSmall ? { bottom: 300 } : { left: window.innerWidth / 3 }
      );
    });
  }, [google, map]);

  return {
    events: data,
    months,
  };
};

export default useCalendarEvents;
