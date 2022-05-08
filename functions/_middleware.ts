import { handleError } from "../lib/utils";

const errorHandler: API = async ({ next }) => {
  return handleError(next);
};

export const onRequest: API[] = [errorHandler];
