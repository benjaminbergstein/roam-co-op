import useSWR from "swr";
import logger from "./logger";

export function useCache<T extends object | string>(
  key: string,
  cacheName: string,
  fetch: () => Promise<T>
) {
  return useSWR<T>(key, async () => cache<T>(key, cacheName, fetch));
}

const cache = async function <T extends object | string>(
  key: string,
  cacheName: string,
  fetch: () => Promise<T>
): Promise<T> {
  const cacheKey = `roamCoop::${cacheName}::${key}`;
  logger.debug(`Cache "${key}"`);
  const cached = localStorage.getItem(cacheKey);
  if (!!cached) {
    const data = JSON.parse(cached) as T;
    logger.debug(`⎣ HIT`, data);
    return data;
  }
  logger.debug(`⎢ MISS`);
  try {
    logger.debug(`⎣ CALCULATE`);
    const newValue = await fetch();
    logger.debug(`Cache "${key}"`);
    if (!!newValue) {
      logger.debug(`⎣  STORE`, newValue);
      localStorage.setItem(cacheKey, JSON.stringify(newValue));
    } else {
      logger.debug(`⎣  EMPTY`, newValue);
    }
    return newValue;
  } catch (e) {
    logger.debug(`Cache "${key}"`);
    logger.debug(`⎣ ERROR`, e);
    throw e;
  }
};

export default cache;
