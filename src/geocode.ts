import { Coordinate } from "./types";
import logger from "./logger";

const cache = async function <T extends object>(
  key: string,
  fetch: () => Promise<T>
): Promise<T> {
  const cacheKey = `roamCoop::${cache}::${key}`;
  logger.debug(`Cache "${key}"`);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached) as T;
    logger.debug(`⎣ HIT`, data);
    return data;
  }
  logger.debug(`⎢ MISS`);
  try {
    logger.debug(`⎣ CALCULATE`);
    const newValue = await fetch();
    logger.debug(`Cache "${key}"`);
    logger.debug(`⎣  STORE`, newValue);
    localStorage.setItem(cacheKey, JSON.stringify(newValue));
    return newValue;
  } catch (e) {
    logger.debug(`Cache "${key}"`);
    logger.debug(`⎣ ERROR`, e);
    throw e;
  }
};

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
