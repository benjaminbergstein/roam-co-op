import { format } from "date-fns";
import { Event } from "./types";

export const queryString = (params: Record<string, string | number>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    searchParams.append(k, v.toString());
  });
  return searchParams.toString();
};

export const hipcamp = (event: Event) =>
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

export const airbnb = (event: Event) =>
  event.position &&
  `https://www.airbnb.com/s/homes?${queryString({
    query: event.location,
    checkin: format(new Date(event.start), "yyyy-MM-dd"),
    checkout: format(new Date(event.end), "yyyy-MM-dd"),
    pets: 1,
    adults: 2,
  })}`;

export const booking = (event: Event) =>
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

export const vrbo = (event: Event) =>
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
