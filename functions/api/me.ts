import { authorize } from "../../lib/utils";

export const onRequest: API = async (context) => {
  try {
    const { token } = await authorize(context);
    const email = token?.email!;

    return new Response(JSON.stringify({ email }));
  } catch (e) {
    if (e === "Unauthorized") {
      return new Response(JSON.stringify(null));
    }
    throw e;
  }
};
