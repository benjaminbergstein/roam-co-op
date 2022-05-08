import jwt_decode from "jwt-decode";

type Env = {
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  API_HOST?: string;
  ROAM_CO_OP: KVNamespace;
  APP_HOST?: string;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const {
    env: {
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CLIENT_ID,
      API_HOST,
      ROAM_CO_OP,
      APP_HOST,
    },
  } = context;
  const { protocol, host } = new URL(context.request.url);
  const inferredUrl = `${protocol}//${host}`;
  const baseUrl = API_HOST || inferredUrl;
  const appUrl = APP_HOST || inferredUrl;
  const redirectUri = new URL("/oauth/callback", baseUrl);
  console.log(redirectUri.toString());

  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const body = new FormData();
  body.append("code", code!);
  body.append("client_id", GOOGLE_CLIENT_ID);
  body.append("client_secret", GOOGLE_CLIENT_SECRET);
  body.append("redirect_uri", redirectUri.toString());
  body.append("grant_type", "authorization_code");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
  });

  const json = await res.json<{ id_token: string }>();
  const { id_token } = json;
  const token = jwt_decode<{ email: string }>(id_token);
  ROAM_CO_OP.put(`tokens:${token.email}`, JSON.stringify(json));
  const homeUrl = new URL("/", appUrl);
  return Response.redirect(`${homeUrl.toString()}?id=${id_token}`);
};
