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

export default logger;
