import useSWR from "swr";
import { useCache } from "./cache";
import logger from "./logger";

export type User = {
  email: string;
  token: string;
};

type CurrentUserReturn = User & {
  api: ApiClient;
  shareId?: string;
  authorized: boolean;
};

const useCurrentUser = () => {
  const { data: id } = useCache<string>(
    "id",
    "application",
    () =>
      new Promise<string>((res) => {
        const url = new URL(document.location.href);
        res(url.searchParams.get("id") as string);
      })
  );
  const url = new URL(document.location.href);
  const shareId = url.searchParams.get("s") as string;

  async function api<T extends object>(path: string, options?: RequestInit) {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...(id && { Authorization: `Bearer ${id}` }),
        ...(shareId && { "Share-Id": shareId }),
      },
    });
    return res.json() as T;
  }

  window.apiClient = api;

  logger.list(
    "useCurrentUser",
    `shareId: ${shareId}`,
    `id: "${
      id ? id?.substring(0, 6) + "..." + id.substr(id.length - 6, 6) : ""
    }"`
  );
  return {
    ...useSWR<CurrentUserReturn>(id ? "me" : null, async () => {
      const user = await api<Omit<User, "id">>("/api/me", {
        method: "POST",
      });
      return { ...user, token: id } as CurrentUserReturn;
    }),
    authorized: shareId || id,
    shareId,
    api,
  };
};

export default useCurrentUser;
