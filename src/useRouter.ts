import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import logger from "./logger";
import useCalendarEvents from "./useCalendarEvents";
import useCurrentUser from "./useCurrentUser";

type PushFn = (newUrl: string) => void;

type RouterType = {
  url: URL;
  push: PushFn;
  params: ParamsType;
  event?: EventType;
};

type RouterHookType = () => RouterType;

type RouteType = [RegExp, Array<string>];

const Routes: Array<RouteType> = [[/^\/event\/([^/]+)$/, ["eventId"]]];

function getParams(
  pathname: string,
  matcher: RegExp,
  named: Array<string>
): ParamsType {
  const matches = pathname.match(matcher);
  const params = matches?.slice(1).reduce<ParamsType>((p, val, i) => {
    const key = named[i];
    return { ...p, [key]: val };
  }, {} as ParamsType);
  return params as ParamsType;
}

type ParamsKeyType = "eventId";
type ParamsType = Partial<Record<ParamsKeyType, string>>;

const useRouter: RouterHookType = () => {
  const { shareId } = useCurrentUser();
  const { data: rawUrl, mutate } = useSWR<string>(
    "rawUrl",
    async () => window.location.href,
    { fallbackData: window.location.href }
  );
  const { events } = useCalendarEvents();
  const url = new URL(rawUrl || window.location.href);

  const params = useMemo(() => {
    return (
      Routes.reduce<ParamsType | undefined>(
        (found: ParamsType | undefined, [matcher, named]: RouteType) => {
          if (found !== undefined) {
            logger.list("ROUTER", JSON.stringify(found), "FOUND");
            return found;
          }
          if (!matcher.test(url.pathname)) {
            logger.list("ROUTER", `${url.pathname}: ${matcher}`, "MISS");
            return found;
          }
          logger.list("ROUTER", `${matcher}`, "MATCH");
          const params = getParams(url.pathname, matcher, named);
          return params as ParamsType | undefined;
        },
        undefined
      ) || {}
    );
  }, [rawUrl]);

  const eventId = params?.eventId;
  const { data: event } = useSWR(
    events?.length || (0 > 0 && eventId) ? `event:${eventId}` : null,
    async () => events?.find((e) => e.uuid === eventId)
  );

  logger.list(
    "ROUTER",
    `Params: ${JSON.stringify(params)}`,
    ...(event ? [`Event: ${event.uuid} "${event.summary}"`] : [])
  );

  useEffect(() => {
    const listener = (e: PopStateEvent) => {
      mutate(window.location.href);
    };

    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, []);

  const push: PushFn = (path: string) => {
    if (path[0] === "/") {
      const newUrl = new URL(url.toString());
      newUrl.pathname = path;
      window.history.pushState({}, "", newUrl);
      mutate(window.location.href);
    } else {
      window.location.href = path;
    }
  };

  return { url, push, params, event };
};

export default useRouter;
