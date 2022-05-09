const doLog = true;

const nullLogger = () => {};

const logger = doLog
  ? console
  : {
      info: nullLogger,
      debug: nullLogger,
      log: nullLogger,
      error: nullLogger,
      table: nullLogger,
      groupEnd: nullLogger,
      group: nullLogger,
    };

const list = (title: string, ...args: Array<string>) => {
  const last = args.pop();
  logger.debug(title);
  args.forEach((s) => {
    logger.debug(`⎢ ${s}`);
  });
  logger.debug(`⎣ ${last}`);
};

export default { ...logger, list };
