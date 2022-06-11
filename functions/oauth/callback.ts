import jwt_decode from "jwt-decode";

export const onRequest: API = async (context) => {
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

  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const body = new FormData();
  body.append("code", code!);
  body.append("client_id", GOOGLE_CLIENT_ID);
  body.append("client_secret", GOOGLE_CLIENT_SECRET);
  body.append("redirect_uri", redirectUri.toString());
  body.append("grant_type", "authorization_code");
  const startTime = +new Date();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
  });

  const json = await res.json<GoogleAuthorizationCodeResponse>();
  const { id_token, expires_in } = json;
  const token = jwt_decode<{ email: string }>(id_token);
  const expire_at = startTime + expires_in * 1000;
  ROAM_CO_OP.put(
    `tokens:${token.email}`,
    JSON.stringify({ ...json, expire_at })
  );
  const homeUrl = new URL("/", appUrl);
  return Response.redirect(`${homeUrl.toString()}?id=${id_token}`);
};
