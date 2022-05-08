import { useEffect } from "react";
import useSWR from "swr";
import { Event, GoogleType } from "./types";
import useGoogle from "./useGoogle";
import geocode from "./geocode";
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

const fetcher = async (
  googlePromise: Promise<GoogleType>,
  token: string
): Promise<Event[]> => {
  const res = await fetch("/roam-coop", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = (await res.json()) as Event[] & { error?: string };

  if (json.error) throw json.error;
  return Promise.resolve(json as Event[]);
};

const useCalendarEvents = (): UseCalendarEventsReturn => {
  const { data: user } = useCurrentUser();
  const email = user?.email;
  const token = user?.token;
  const { google, googlePromise, map } = useGoogle();
  const { error, data } = useSWR<Event[]>(
    email ? `${email}:eventData` : null,
    async () => fetcher(googlePromise, token!)
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

  console.log(error);
  if (error) return { events: undefined, error: true };

  const months = getMonths(data);

  return {
    events: data,
    months,
  };
};

export default useCalendarEvents;
