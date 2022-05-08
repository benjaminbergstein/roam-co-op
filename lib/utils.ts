import jwtDecode from "jwt-decode";

export const authorize = async (
  context: AppContext
): Promise<Authorization> => {
  const { ROAM_CO_OP } = context.env;
  const header = context.request.headers.get("authorization");
  const shareId = context.request.headers.get("share-id");

  try {
    if (header) {
      const [_type, rawToken] = header.split(" ");
      const token = jwtDecode<TokenType>(rawToken);
      const email = token.email;
      const data = await ROAM_CO_OP.get(`tokens:${email}`);
      const oauth_response = data ? JSON.parse(data) : undefined;
      return { type: "user", token, oauth_response };
    }

    if (shareId) {
      const doc = await ROAM_CO_OP.get(`shares:${shareId}`);
      const share = JSON.parse(doc!);
      return { type: "share", share };
    }

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
