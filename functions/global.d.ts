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

type TokenKeyType = `tokens:${string}`;
type SharesKeyType = `shares:${string}:${string}` | `shares:${string}`;
type Keys = TokenKeyType | SharesKeyType;
type RoamCoopNamespaceType = KVNamespace<Keys>;

interface AppEnv {
  ROAM_CO_OP: RoamCoopNamespaceType;
  APP_HOST?: string;
  API_HOST?: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
}

type AppContext = EventContext<AppEnv, any, any>;

type API<T extends AppEnv = AppEnv> = PagesFunction<T>;

type ApiClient = <T extends object>(
  path: string,
  options: RequestInit
) => Promise<T>;

interface Window {
  apiClient: ApiClient;
  console: never;
}

type ShareType = {
  uuid: string;
  email: string;
  url: string;
};
type TokenType = { email: string };

type OauthResponseType = {
  access_token: string;
  refresh_token: string;
};

type Authorization =
  | {
      type: "share";
      share: ShareType;
      token?: never;
    }
  | {
      type: "user";
      token: TokenType;
      oauth_response: OauthResponseType;
      share?: never;
    };

type AttendeeParamsType = { cn: string; partstat: "ACCEPTED" | "NEEDS-ACTION" };
type AttendeeType = {
  val: string;
  params: AttendeeParamsType;
};

type EventType = {
  start: Date | string;
  end: Date | string;
  uuid: string;
  attendee: AttendeeType[];
  location: string;
  position?: Coordinate;
  summary: string;
  next?: EventType;
  prev?: EventType;
};

type Coordinate = google.maps.LatLngLiteral;
