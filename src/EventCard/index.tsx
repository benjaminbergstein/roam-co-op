import { useRef, useEffect, useState, FC, MutableRefObject } from "react";
import { Easing, Tween, update } from "@tweenjs/tween.js";

import { format, isBefore } from "date-fns";
import MapOverlay from "../MapOverlay";
import { ColorConfig, EventStateType } from "../types";
import * as bookingLinks from "../bookingLinks";
import { FaCheck, FaQuestionCircle } from "react-icons/fa";
import DayCircle from "./DayCircle";
import useGoogle from "../useGoogle";
import useRouter from "../useRouter";
import useGeocodedCoordinate from "../useGeocodedCoordinate";

type Props = {
  event: EventType;
  boundsRef: MutableRefObject<google.maps.LatLngBounds | null>;
};

const Users = {
  bennyjbergstein: "Ben",
  jadephare: "Jade",
  florenm2: "Mary",
};
const name = (val: string): string => {
  const key = val.split(":")[1].split("@")[0] as keyof typeof Users;
  return Users[key];
};

const colorConfig: Record<EventStateType, ColorConfig> = {
  past: {
    border: "border-stone-500",
    borderHover: "bg-zinc-100",
    bg: "bg-stone-500",
    bgHover: "bg-stone-500",
  },
  ongoing: {
    border: "border-amber-700",
    borderHover: "bg-zinc-100",
    bg: "bg-amber-700",
    bgHover: "bg-amber-300",
  },
  future: {
    border: "border-emerald-700",
    borderHover: "bg-zinc-100",
    bg: "bg-emerald-700",
    bgHover: "bg-emerald-300",
  },
};

const EventCard: FC<Props> = ({ event, boundsRef }) => {
  const [isHovered, setHovered] = useState<boolean>(false);
  const { params, push, event: currentEvent, onlyMine } = useRouter();
  const isBeforeOrAfter = [
    currentEvent?.prev?.uuid,
    currentEvent?.next?.uuid,
  ].includes(event.uuid);
  const { eventId } = params;
  const isEvent = eventId === event.uuid;
  const isVisible = isEvent || isBeforeOrAfter;

  const { map } = useGoogle();
  const { data: position } = useGeocodedCoordinate(event.location);
  const { data: prevPosition } = useGeocodedCoordinate(event?.prev?.location);
  const { data: nextPosition } = useGeocodedCoordinate(event?.next?.location);
  const divRef = useRef<HTMLButtonElement>(null);

  const isSmall = window.innerWidth < 400;

  useEffect(() => {
    if (!map) return;
    if (!position) return;
    if (!isEvent) return;
    let unmounted = false;
    const currentBounds = map.getBounds()!;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(position);
    if (prevPosition) bounds.extend(prevPosition);
    if (nextPosition) bounds.extend(nextPosition);

    const tween = new Tween<google.maps.LatLngBounds>(currentBounds) // Create a new tween that modifies 'cameraOptions'.
      .to(bounds, 1500) // Move to destination in 1.5 second.
      .easing(Easing.Linear.None) // Use an easing function to make the animation smooth.
      .onUpdate(() => {
        map.fitBounds(
          currentBounds,
          isSmall
            ? { bottom: 300, left: 30, right: 30 }
            : { top: 200, left: window.innerWidth / 2, bottom: 200, right: 200 }
        );
      })
      .start(); // Start the tween immediately.

    // Setup the animation loop.
    function animate(time: number) {
      if (unmounted) return;
      requestAnimationFrame(animate);
      update(time);
    }

    requestAnimationFrame(animate);
    return () => {
      tween.stop();
    };
  }, [map, position, isEvent]);

  useEffect(() => {
    if (!position) return;
    if (!map) return;
    if (!boundsRef.current) return;
    if (eventId) return;
    boundsRef.current.extend(position);
    map.fitBounds(
      boundsRef.current,
      isSmall ? { bottom: 300 } : { left: window.innerWidth / 3 }
    );
  }, [isEvent, position]);

  const isPast = isBefore(event.endDate, new Date());
  const isStarted = isBefore(event.startDate, new Date());

  const state = isPast ? "past" : isStarted ? "ongoing" : "future";
  const config = colorConfig[state];

  useEffect(() => {
    if (!isHovered) return;
    if (!divRef.current) return;
    divRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isHovered]);

  useEffect(() => {
    if (state !== "ongoing") return;
    if (eventId) return;
    setTimeout(() => {
      if (!divRef.current) return;
      divRef.current.scrollIntoView({ inline: "center", block: "center" });
    }, 100);
  }, [state, eventId]);

  if (!position) return null;

  return (
    <>
      {(isVisible || !eventId) && (
        <button
          ref={divRef}
          onClick={() => {
            push(
              `/event/${event.uuid}`,
              onlyMine ? { mine: "true" } : undefined
            );
          }}
          className={`${isBeforeOrAfter ? "opacity-80" : ""} flex ${
            isVisible ? "" : "flex-1"
          } ${isVisible ? "" : "items-center"} bg-white text-left ${
            isHovered ? `z-50` : `z-0`
          } ${
            config.border
          } relative border-l-4 border-dashed ml-[15px] py-2 pl-[30px] cursor-pointer`}
          style={{
            order: format(
              isStarted && !isPast ? new Date() : event.startDate,
              "yyyyMMdd"
            ),
          }}
        >
          <DayCircle
            state={state}
            isHovered={isHovered}
            isEvent={isEvent}
            isBeforeOrAfter={isBeforeOrAfter}
            config={config}
            start={event.start as string}
          />
          <div className="w-full">
            <div className="text-sm font-semibold">{event.summary}</div>
            <div className="text-[16px] text-stone-500">
              {event.location}
              {` • ${format(event.startDate, "MMM do")} - ${format(
                event.endDate,
                "MMM do"
              )}`}
            </div>
            {isEvent && (
              <div className={`top-full bg-white flex flex-col my-3`}>
                <div>
                  {event.attendee &&
                    (Array.isArray(event.attendee)
                      ? event.attendee
                      : [event.attendee]
                    ).map(({ val, params }) => (
                      <div className="text-xs flex items-center border-t border-stone-200 py-3 px-1">
                        <div className="w-5">
                          {params.partstat === "ACCEPTED" ? (
                            <FaCheck style={{ color: "green" }} />
                          ) : (
                            <FaQuestionCircle style={{ color: "orange" }} />
                          )}
                        </div>
                        <div>{name(val)}</div>
                      </div>
                    ))}
                </div>
                {(!isStarted || !isPast) && (
                  <div className="text-[16px] flex items-center w-full gap-2 xl:gap-3 border-t border-stone-200 pt-2">
                    <div className="tracking-wider shrink-0 uppercase text-stone-700 flex items-center">
                      Book:
                    </div>
                    <div>
                      <a
                        className="text-sky-600"
                        href={bookingLinks.hipcamp(event)}
                        target="_BLANK"
                        rel="noreferrer"
                      >
                        Hipcamp
                      </a>
                    </div>
                    <div>
                      <a
                        className="text-sky-600"
                        href={bookingLinks.airbnb(event)}
                        target="_BLANK"
                        rel="noreferrer"
                      >
                        Airbnb
                      </a>
                    </div>
                    <div>
                      <a
                        className="text-sky-600"
                        href={bookingLinks.vrbo(event)}
                        target="_BLANK"
                        rel="noreferrer"
                      >
                        VRBO
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      )}
      {(isVisible || !eventId) && (
        <MapOverlay map={map} position={position}>
          <div
            onClick={() => {
              push(
                `/event/${event.uuid}`,
                onlyMine ? { mine: "true" } : undefined
              );
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className={`flex shrink-0 cursor-pointer items-center justify-center h-[10px] w-[10px] -my-[5px] ${
                isBeforeOrAfter
                  ? `md:h-[30px] md:w-[30px] md:-my-[18px]`
                  : isEvent
                  ? `md:h-[36px] md:w-[36px] md:-my-[18px]`
                  : "md:h-[26px] md:w-[26px] md:-my-[13px]"
              }`}
            >
              <div
                className={`shrink-0 border-white border-2 ${
                  isBeforeOrAfter
                    ? `${config.bg} opacity-80 w-[23px] h-[23px]`
                    : isEvent
                    ? `${config.bg} w-[30px] h-[30px]`
                    : isHovered
                    ? `w-[15px] h-[15px]`
                    : `${config.bg} w-[10px] h-[10px]`
                } rounded-xl`}
              ></div>
            </div>
          </div>
        </MapOverlay>
      )}
    </>
  );
};

export default EventCard;
