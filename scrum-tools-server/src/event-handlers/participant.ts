import { Socket } from "socket.io";
import { ConnectionState, ServerState } from "../session";
import { disconnectWithError } from "./common";

export function handleParticipantLeave(ack: (err: string) => void, serverState: ServerState, connectionState: ConnectionState, socket: Socket) {
  if (connectionState.pokerSessionId === undefined || !serverState[connectionState.pokerSessionId]) {
    return disconnectWithError("Session not/no longer known", ack, socket);
  }

  const session = serverState[connectionState.pokerSessionId];
  const existingPlayer = session.players.find((p) => p.name === connectionState.playerName);
  if (connectionState.playerName === undefined || !existingPlayer) {
    return disconnectWithError("Player not/no longer known", ack, socket);
  }

  existingPlayer.status = "left";
  ack("goodbye");
}
