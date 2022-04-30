import { Coordinate } from "./types";

const cache = async function <T extends object>(
  key: string,
  fetch: () => Promise<T>
): Promise<T> {
  const cacheKey = `roamCoop::${cache}::${key}`;
  const cached = localStorage.getItem(cacheKey);
  // console.log({ cached });
  if (cached) return JSON.parse(cached) as T;
  const newValue = await fetch();
  // console.log({ newValue });
  localStorage.setItem(cacheKey, JSON.stringify(newValue));
  return newValue;
};

const geocode = async (
  geocoder: google.maps.Geocoder,
  location: string
): Promise<Coordinate> => {
  const fetch = (): Promise<Coordinate> =>
    new Promise<Coordinate>((res, rej) => {
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
