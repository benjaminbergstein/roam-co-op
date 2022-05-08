import { Coordinate } from "./types";
import logger from "./logger";
import cache from "./cache";

const geocode = async (
  geocoder: google.maps.Geocoder,
  location: string
): Promise<Coordinate> => {
  const fetch = (): Promise<Coordinate> =>
    new Promise<Coordinate>((res, rej) => {
      if (location === "" || location === undefined) {
        rej("LOCATION_MISSING");
        return;
      }
      geocoder.geocode({ address: location }, (results: any, status: any) => {
        if (status !== "OK") {
          rej(status);
          return;
        }
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        res({ lat, lng });
      });
    });
  return cache<Coordinate>(`geocoder::${location}`, fetch);
};

export default geocode;
