declare module "ical.js" {
  export type ICALFieldType =
    | "dtstart"
    | "dtend"
    | "uid"
    | "attendee"
    | "location"
    | "summary";

  export type ICALEventType<T = object> = [ICALFieldType, T, any, string];

  type ParseFn = (
    data: string
  ) => ["vcalendar", any, Array<["vevent", ICALEventType]>];
  const parse: ParseFn;
  export = { parse };
}

type RoamCoopNamespaceType = KVNamespace<`tokens:${string}`>;
