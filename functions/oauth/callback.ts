import jwt_decode from "jwt-decode";

export async function onRequest(context) {
  const {
    env: {
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CLIENT_ID,
      API_HOST,
      ROAM_CO_OP,
      APP_HOST,
      CF_PAGES_URL,
    },
  } = context;
  const redirectUri = new URL(API_HOST);
  redirectUri.pathname = "/oauth/callback";
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const body = new FormData();
  body.append("code", code);
  body.append("client_id", GOOGLE_CLIENT_ID);
  body.append("client_secret", GOOGLE_CLIENT_SECRET);
  body.append("redirect_uri", redirectUri.toString());
  body.append("grant_type", "authorization_code");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
  });

  const json = await res.json();
  const { id_token } = json;
  const token = jwt_decode<{ email: string }>(id_token);
  ROAM_CO_OP.put(`tokens:${token.email}`, JSON.stringify(json));
  const homeUrl = new URL(APP_HOST || context.request.url);
  homeUrl.pathname = "/";
  return Response.redirect(`${homeUrl.toString()}?id=${id_token}`);
}
