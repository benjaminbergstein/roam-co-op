import { parse, ICALEventType, ICALFieldType } from "ical.js";
import fetch from "isomorphic-unfetch";
import { authorize } from "../lib/utils";

const icalUrl =
  "https://calendar.google.com/calendar/ical/uorgac10bjdg7h591uoe63mkfc%40group.calendar.google.com/private-7fdf12cc6357da7816dc153b6e91f6e8/basic.ics";

type TransformFn = (
  data: [string, object, string, string],
  acc: Partial<EventType>
) => Partial<EventType>;

type AttendeeType = {
  val: string;
  params: object;
};

type EventType = {
  start: Date;
  end: Date;
  uuid: string;
  attendee: AttendeeType[];
  location: string;
  summary: string;
};

const transforms: Record<ICALFieldType, TransformFn> = {
  dtstart: (data) => ({ start: new Date(data[3]) }),
  dtend: (data) => ({ end: new Date(data[3]) }),
  uid: (data) => ({ uuid: data[3].split("@")[0] }),
  attendee: (data, acc) => ({
    attendee: [...(acc.attendee || []), { val: data[3], params: data[1] }],
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

const fetchData = async () => {
  const res = await fetch(icalUrl);
  const text = await res.text();
  const events = parse(text);
  return events[2].map(transformEvent);
};

type Env = {
  ROAM_CO_OP: RoamCoopNamespaceType;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    await authorize(context);
    const data = await fetchData();
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
