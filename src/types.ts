export type GoogleType = typeof google;

export type Attendee = {
  val: string;
  params: {
    PARTSTAT: string;
  };
};

export type Event = {
  start: string;
  end: string;
  location: string;
  summary: string;
  type: string;
  position?: { lat: number; lng: number };
  attendee: Attendee | Attendee[];
};

export type Coordinate = { lat: number; lng: number };

export type EventStateType = "past" | "ongoing" | "future";

export type ColorConfig = Record<
  "border" | "borderHover" | "bg" | "bgHover",
  string
>;
