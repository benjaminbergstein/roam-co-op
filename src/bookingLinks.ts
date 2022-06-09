import { format } from "date-fns";

export const queryString = (params: Record<string, string | number>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    searchParams.append(k, v.toString());
  });
  return searchParams.toString();
};

export const hipcamp = (event: EventType) =>
  event.position &&
  `https://www.hipcamp.com/en-US/search/group-2?${queryString({
    arrive: format(event.startDate, "yyyy-MM-dd"),
    depart: format(event.endDate, "yyyy-MM-dd"),
    adults: 2,
    pets: 1,
    children: 0,
    q: event.location,
    ...event.position,
  })}`;

export const airbnb = (event: EventType) =>
  event.position &&
  `https://www.airbnb.com/s/homes?${queryString({
    query: event.location,
    checkin: format(event.startDate, "yyyy-MM-dd"),
    checkout: format(event.endDate, "yyyy-MM-dd"),
    pets: 1,
    adults: 2,
  })}`;

export const booking = (event: EventType) =>
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
    checkin_year: format(event.startDate, "yyyy"),
    checkin_month: format(event.startDate, "MM"),
    checkin_monthday: format(event.startDate, "d"),
    checkout_year: format(event.endDate, "yyyy"),
    checkout_month: format(event.endDate, "MM"),
    checkout_monthday: format(event.endDate, "d"),
    group_adults: 5,
    group_children: 0,
  })}`;

export const vrbo = (event: EventType) =>
  event.position &&
  `https://www.vrbo.com/search/keywords:${event.location
    .replace(/\s/g, "-")
    .replace(/[^a-zA-Z\-]/g, "")}/arrival:${format(
    event.startDate,
    "yyyy-MM-dd"
  )}/departure:${format(
    event.endDate,
    "yyyy-MM-dd"
  )}/filter:27?adultsCount=2&petIncluded=true`;
