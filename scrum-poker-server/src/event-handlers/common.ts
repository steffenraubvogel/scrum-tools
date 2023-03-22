import { Socket } from "socket.io";

export function disconnectWithError(errMsg: string, ack: (err: string) => void, socket: Socket) {
  ack(errMsg);
  socket.disconnect();
}
