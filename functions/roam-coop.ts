import { format } from "date-fns";
import { parse, ICALEventType, ICALFieldType } from "ical.js";
import fetch from "isomorphic-unfetch";
import { cache, authorize } from "../lib/utils";

const icalUrl =
  "https://calendar.google.com/calendar/ical/uorgac10bjdg7h591uoe63mkfc%40group.calendar.google.com/private-7fdf12cc6357da7816dc153b6e91f6e8/basic.ics";

type TransformFn = (
  data: [string, object, string, string],
  acc: Partial<EventType>
) => Partial<EventType>;

const transforms: Record<ICALFieldType, TransformFn> = {
  dtstart: (data) => ({ start: data[3] }),
  dtend: (data) => ({ end: data[3] }),
  uid: (data) => ({ uuid: data[3].split("@")[0] }),
  attendee: (data, acc) => ({
    attendee: [
      ...(acc.attendee || []),
      { val: data[3], params: data[1] as AttendeeParamsType },
    ],
  }),
  location: (data) => ({ location: data[3] }),
  summary: (data) => ({ summary: data[3] }),
};

const transformEvent = (data: ["vevent", ICALEventType[]]): EventType =>
  data[1].reduce(
    (acc: Partial<EventType>, datum): Partial<EventType> => {
      const key = datum[0];
      if (!transforms[key]) return acc as Partial<EventType>;
      return { ...acc, ...transforms[key](datum, acc) } as Partial<EventType>;
    },
    { raw: data } as Partial<EventType>
  ) as EventType;

const fetchData = async (authorization: Authorization, onlyMine: boolean) => {
  const res = await fetch(icalUrl);
  const text = await res.text();
  const events = parse(text);
  const currentUserEmail = authorization.token?.email;

  return events[2]
    .map(transformEvent)
    .filter((event) => {
      if (currentUserEmail !== undefined && onlyMine === true)
        return (event.attendee || []).some(
          (attendee) => attendee.params.cn === currentUserEmail
        );

      if (event.location === "") return false;
      if (authorization.type === "share") {
        return (event.attendee || []).some(
          (attendee) =>
            attendee.params.cn === authorization.share.email &&
            attendee.params.partstat === "ACCEPTED"
        );
      }
      if (authorization.type === "user") return true;
    })
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .map((event, idx, arr) => {
      return {
        ...event,
        prev: idx - 1 < 0 ? undefined : arr[idx - 1],
        next: arr[idx + 1],
      };
    });
};

export const onRequest: API = async (context) => {
  try {
    const onlyMine =
      new URL(context.request.url).searchParams.get("mine") === "true";
    const authorization = await authorize(context);
    const data = await cache(context, "calendar", () =>
      fetchData(authorization, onlyMine)
    );
    data.forEach((datum) => {
      cache(context, `event:${datum.uuid}`, () => Promise.resolve(datum));
    });
    return new Response(JSON.stringify(data));
  } catch (e) {
    if (e === "Unauthorized") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    } else {
      throw e;
    }
  }
};
