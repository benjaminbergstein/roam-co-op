import {
  FC,
  createContext,
  useEffect,
  useState,
  useRef,
  MutableRefObject,
  useContext,
  PropsWithChildren,
} from "react";
import { Coordinate, GoogleType } from "./types";

const googlePromise: Promise<GoogleType> = new Promise((res, rej) => {
  const timeoutAt = +new Date() + 30000;
  const checkForGoogle = () => {
    setTimeout(() => {
      const now = +new Date();

      if (typeof window.google !== "undefined") {
        res(google);
      } else if (now > timeoutAt) {
        rej("timed out after 30 seconds waiting for google to load");
      } else {
        checkForGoogle();
      }
    }, 300);

    checkForGoogle();
  };
});

const GoogleContext = createContext<UseGoogleReturnType | undefined>(undefined);

type UseGoogleReturnType = {
  loading: boolean;
  google: GoogleType | undefined;
  error: string | false;
  map: google.maps.Map | undefined;
  mapRef: MutableRefObject<HTMLDivElement | null>;
};

type UseGoogleHookArgsType = {
  center: Coordinate;
  zoom: number;
};

type UseGoogleHook = () => UseGoogleReturnType;

const useGoogle: UseGoogleHook = () => {
  const value = useContext(GoogleContext);
  if (!value)
    throw "No GoogleContext available. Did you provide one with <GoogleProvider>?";
  return value;
};

export const GoogleProvider: FC<PropsWithChildren<UseGoogleHookArgsType>> = ({
  center,
  zoom,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | false>(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | undefined>();

  const awaitGoogle = async () => {
    try {
      await googlePromise;
      setLoading(false);
      setError(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!loading) return;
    awaitGoogle();
  });

  useEffect(() => {
    if (!google) return;
    if (map) return;
    if (!mapRef.current) return;

    setMap(
      new google.maps.Map(mapRef.current, {
        center,
        zoom,
      })
    );
  });

  const value = {
    loading,
    google,
    map,
    mapRef,
    error,
  };

  return (
    <GoogleContext.Provider value={value}>{children}</GoogleContext.Provider>
  );
};

export default useGoogle;
