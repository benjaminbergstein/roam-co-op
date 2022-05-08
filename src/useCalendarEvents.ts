import { useEffect } from "react";
import useSWR from "swr";
import { Event, GoogleType } from "./types";
import useGoogle from "./useGoogle";
import { min, max, eachMonthOfInterval } from "date-fns";
import useCurrentUser from "./useCurrentUser";

type UseCalendarEventsReturn = {
  events?: Event[];
  error?: boolean;
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

type EventsResponse = Event[] & { error?: string };

const useCalendarEvents = (): UseCalendarEventsReturn => {
  const { api, shareId, data: user } = useCurrentUser();
  const email = user?.email;
  const { google, map } = useGoogle();
  const { error, data } = useSWR<Event[]>(
    email || shareId ? `${[email, shareId].join("|")}:eventData` : null,
    async () => {
      if (!api) throw "error";
      const json = await api<EventsResponse>("/roam-coop", {});

      if (json.error) throw json.error;
      return json as Event[];
    }
  );

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

  if (error) return { events: undefined, error: true };

  const months = getMonths(data);

  return {
    events: data,
    months,
  };
};

export default useCalendarEvents;
