import jwtDecode from "jwt-decode";

export const cache = async <Data extends object = object>(
  context: AppContext,
  key: string,
  calculate: () => Promise<Data>
): Promise<Data> => {
  const { ROAM_CO_OP } = context.env;
  const cachedData = await ROAM_CO_OP.get(`cache:${key}`);
  if (cachedData) {
    return JSON.parse(cachedData) as Data;
  }

  return await calculate();
};

export const getAccessToken = async (context: AppContext) => {
  const { token, type, ...res } = await authorize(context);
  if (!("oauth_response" in res))
    return new Response(JSON.stringify({ mediaItems: [] }));
  const expire_at = res.oauth_response.expire_at;
  const access_token = res.oauth_response?.access_token;

  if (!expire_at || expire_at < +new Date()) {
    return await refreshAccessToken(context);
  }

  return access_token;
};

export const refreshAccessToken = async (context: AppContext) => {
  const {
    env: { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, ROAM_CO_OP },
  } = context;
  const userAuthorization = await getUserAuthorization(context);
  if (!userAuthorization)
    throw "Error refreshing token: user authorization not found";
  const { oauth_response, token } = userAuthorization;
  const { refresh_token: refreshToken } = oauth_response;

  const body = new FormData();
  body.append("client_id", GOOGLE_CLIENT_ID);
  body.append("client_secret", GOOGLE_CLIENT_SECRET);
  body.append("refresh_token", refreshToken);
  body.append("grant_type", "refresh_token");
  const startTime = +new Date();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
  });

  const data = await res.json<GoogleRefreshTokenResponse>();
  const expires_in = data.expires_in;
  const access_token = data.access_token;
  const expire_at = startTime + expires_in * 1000;
  ROAM_CO_OP.put(
    `tokens:${token.email}`,
    JSON.stringify({
      oauth_response: { ...oauth_response, ...data, expire_at },
    })
  );

  return access_token;
};

const getUserAuthorization = async (
  context: AppContext
): Promise<UserAuthorization | null> => {
  const { ROAM_CO_OP } = context.env;
  const header = context.request.headers.get("authorization");

  if (!header) return null;

  const [_type, rawToken] = header.split(" ");
  const token = jwtDecode<TokenType>(rawToken);
  const email = token.email;
  const data = await ROAM_CO_OP.get(`tokens:${email}`);
  const oauth_response = data ? JSON.parse(data) : undefined;
  return { type: "user", token, oauth_response };
};

export const authorize = async (
  context: AppContext
): Promise<Authorization> => {
  const { ROAM_CO_OP } = context.env;
  const shareId = context.request.headers.get("share-id");

  try {
    if (shareId) {
      const doc = await ROAM_CO_OP.get(`shares:${shareId}`);
      const share = JSON.parse(doc!);
      return { type: "share", share };
    }

    const userAuthorization = await getUserAuthorization(context);
    if (userAuthorization) return userAuthorization;

    throw "Unauthorized";
  } catch (e) {
    log(e as any);
    throw "Unauthorized";
  }
};

const logs: string[] = [];

export const log = (message: string) => {
  logs.push(message);
};

export const handleError = async (
  cb: () => Promise<Response>
): Promise<Response> => {
  try {
    return await cb();
  } catch (e: any) {
    log(e.message || e);
    return new Response(logs.join("\n"));
  }
};

export const getRoutes = (context: AppContext) => {
  const {
    env: { API_HOST, APP_HOST },
    request: { url },
  } = context;
  const { protocol, host } = new URL(url);
  const inferredUrl = `${protocol}//${host}`;
  const apiUrl = API_HOST || inferredUrl;
  const appUrl = APP_HOST || inferredUrl;

  return {
    apiUrl,
    appUrl,
    path: (path: `/${string}`, app: boolean = true) =>
      new URL(path, app ? appUrl : apiUrl),
  };
};

type SerializerType = () => string;
type ModelType<T> = T & { serialize: SerializerType };
type CollectionType<T> = { items: ModelType<T>[]; serialize: SerializerType };

export function toModel<T extends object>(attributes: T): ModelType<T> {
  return { ...attributes, serialize: () => JSON.stringify(attributes) };
}

export function toCollection<T extends object>(models: T[]): CollectionType<T> {
  return {
    items: models.map(toModel),
    serialize: () => JSON.stringify(models),
  };
}
