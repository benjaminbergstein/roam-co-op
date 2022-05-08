import { authorize } from "../../lib/utils";

type Env = {
  ROAM_CO_OP: RoamCoopNamespaceType;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const { token } = await authorize(context);
    const email = token.email;

    return new Response(JSON.stringify({ email }));
  } catch (e) {
    if (e === "Unauthorized") {
      return new Response(JSON.stringify(null));
    }
    throw e;
  }
};
