import { Logger } from "tslog";

export function createLogger(name: string) {
  return new Logger({ name, hideLogPositionForProduction: true });
}
