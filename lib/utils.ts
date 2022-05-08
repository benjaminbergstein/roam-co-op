import jwtDecode from "jwt-decode";

export const authorize = async (context) => {
  const { ROAM_CO_OP } = context.env;
  const header = context.request.headers.get("authorization");
  if (!header) throw "Unauthorized";

  try {
    const [_type, rawToken] = header.split(" ");
    const token = jwtDecode<{ email: string }>(rawToken);
    const email = token.email;
    const oauth_response = await ROAM_CO_OP.get(`tokens:${email}`);
    return { token, oauth_response };
  } catch (e) {
    console.error(e);
    throw "Unauthorized";
  }
};
