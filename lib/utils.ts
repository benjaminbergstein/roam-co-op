import jwtDecode from "jwt-decode";

type Env = {
  ROAM_CO_OP: RoamCoopNamespaceType;
};

export const authorize = async (context: EventContext<Env, any, any>) => {
  const { ROAM_CO_OP } = context.env;
  const header = context.request.headers.get("authorization");
  if (!header) throw "Unauthorized";

  try {
    const [_type, rawToken] = header.split(" ");
    const token = jwtDecode<{ email: string }>(rawToken);
    const email = token.email;
    const data = await ROAM_CO_OP.get(`tokens:${email}`);
    const oauth_response = data ? JSON.parse(data) : undefined;
    return { token, oauth_response };
  } catch (e) {
    console.error(e);
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
