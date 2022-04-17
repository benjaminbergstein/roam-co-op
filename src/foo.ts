import ical from "node-ical";
import fetch from "isomorphic-unfetch";
import fs from "fs";

const icalUrl =
  "https://calendar.google.com/calendar/ical/uorgac10bjdg7h591uoe63mkfc%40group.calendar.google.com/private-7fdf12cc6357da7816dc153b6e91f6e8/basic.ics";

const main = async () => {
  const res = await fetch(icalUrl);
  const text = await res.text();
  const events = ical.sync.parseICS(text);
  fs.writeFileSync("src/data.json", JSON.stringify(events, null, 2));
};

main();

export {};
export default undefined;
