const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/photoslibrary.readonly",
];

type Env = {
  GOOGLE_CLIENT_ID: string;
  API_HOST?: string;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const {
    env: { GOOGLE_CLIENT_ID, API_HOST },
  } = context;
  const redirectUri = new URL(API_HOST || context.request.url);
  redirectUri.pathname = "/oauth/callback";
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", redirectUri.toString());
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", SCOPES.join(" "));
  url.searchParams.append("include_granted_scopes", "true");
  url.searchParams.append("prompt", "consent select_account");

  return Response.redirect(url.toString());
};
