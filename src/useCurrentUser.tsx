import useSWR from "swr";
import { useCache } from "./cache";
import logger from "./logger";

export type User = {
  email: string;
  token: string;
};

const useCurrentUser = () => {
  const { data: id } = useCache<string>(
    "id",
    () =>
      new Promise<string>((res) => {
        const url = new URL(document.location.href);
        logger.debug(url);
        logger.debug(url.searchParams.get("id"));
        res(url.searchParams.get("id") as string);
      })
  );
  logger.debug("useCurrentUser");
  logger.debug(`⎣ id:`, id);
  return useSWR<User>(id ? "me" : null, async () => {
    const res = await fetch("/api/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${id}`,
      },
    });
    const user = (await res.json()) as Omit<User, "id">;
    return { ...user, token: id } as User;
  });
};

export default useCurrentUser;
