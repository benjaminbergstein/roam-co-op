import useSWR from "swr";
import geocode from "./geocode";
import useGoogle from "./useGoogle";

const useGeocodedCoordinate = (location: string | undefined) => {
  const { googlePromise } = useGoogle();
  return useSWR<Coordinate | undefined>(
    location ? `coordinate:${location}` : null,
    async () => {
      const google = await googlePromise;
      const geocoder = new google.maps.Geocoder();
      if (!location) return undefined;
      return await geocode(geocoder, location);
    },
    {
      errorRetryInterval: 1000,
    }
  );
};

export default useGeocodedCoordinate;
