import * as ICAL from "ical.js";
import fetch from "isomorphic-unfetch";

const icalUrl =
  "https://calendar.google.com/calendar/ical/uorgac10bjdg7h591uoe63mkfc%40group.calendar.google.com/private-7fdf12cc6357da7816dc153b6e91f6e8/basic.ics";

const transforms = {
  dtstart: (data) => ({ start: new Date(data[3]) }),
  dtend: (data) => ({ end: new Date(data[3]) }),
  uid: (data) => ({ uuid: data[3].split("@")[0] }),
  attendee: (data, acc) => ({
    attendee: [...(acc.attendee || []), { val: data[3], params: data[1] }],
  }),
  location: (data) => ({ location: data[3] }),
  summary: (data) => ({ summary: data[3] }),
};

const transformEvent = (data) =>
  data[1].reduce(
    (acc, datum) => {
      const key = datum[0];
      if (!transforms[key]) return acc;
      return { ...acc, ...transforms[key](datum, acc) };
    },
    { raw: data }
  );

const fetchData = async () => {
  const res = await fetch(icalUrl);
  const text = await res.text();
  const events = ICAL.parse(text);
  return events[2].map(transformEvent);
};

export async function onRequest(context) {
  const data = await fetchData();
  return new Response(JSON.stringify(data));
}
