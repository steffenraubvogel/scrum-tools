import { Socket } from "socket.io";
import { createLogger } from "../logging";

const logger = createLogger("comm");

export function disconnectWithError(errMsg: string, ack: (err: string) => void, socket: Socket) {
  logger.warn("[" + socket.id + "] ack with error: " + errMsg);
  ack(errMsg);
  socket.disconnect();
}
