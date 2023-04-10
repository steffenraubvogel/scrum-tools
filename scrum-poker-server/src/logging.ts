import { Logger } from "tslog";

export function createLogger(name: string) {
  return new Logger({
    name,
    hideLogPositionForProduction: true,
    minLevel: +(process.env.SP_LOG_LEVEL || 2),
    prettyLogTemplate: "{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}} {{logLevelName}} {{name}} ",
    prettyLogTimeZone: "local",
  });
}
