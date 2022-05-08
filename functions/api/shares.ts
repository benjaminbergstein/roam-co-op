import { authorize, getRoutes, toCollection, toModel } from "../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const onRequestGet: API = async (context) => {
  const {
    env: { ROAM_CO_OP },
  } = context;
  const authorization = await authorize(context);
  const email = authorization?.token?.email;
  const listResponse = await ROAM_CO_OP.list<SharesKeyType>({
    prefix: `shares:${email}`,
  });
  const shares = toCollection<ShareType>(
    await Promise.all(
      listResponse.keys.map(
        async ({
          name,
        }: KVNamespaceListKey<SharesKeyType>): Promise<ShareType> => {
          const doc = (await ROAM_CO_OP.get(name as SharesKeyType)) as string;
          return JSON.parse(doc);
        }
      )
    )
  );

  return new Response(shares.serialize());
};

export const onRequestPost: API = async (context) => {
  const {
    env: { ROAM_CO_OP },
  } = context;
  const { path } = getRoutes(context);
  const { token } = await authorize(context);
  const email = token?.email;

  if (!email) throw "Forbidden";

  const uuid = uuidv4();
  const url = path(`/`);
  url.searchParams.append("s", uuid);
  const share = toModel<ShareType>({ uuid, url: url.toString(), email });
  const doc = share.serialize();

  await ROAM_CO_OP.put(`shares:${email}:${uuid}`, doc);
  await ROAM_CO_OP.put(`shares:${uuid}`, doc);

  return new Response(doc);
};
