import { Socket } from "socket.io";
import { ConnectionState, ServerState } from "../session";
import { disconnectWithError } from "./common";

export function handleLeaderReveal(ack: (err: string) => void, serverState: ServerState, connectionState: ConnectionState, socket: Socket) {
  const validationError = validateOperation(serverState, connectionState);
  if (validationError) {
    return disconnectWithError(validationError, ack, socket);
  }

  serverState[connectionState.pokerSessionId!].state = "revealed";
}

export function handleLeaderReset(ack: (err: string) => void, serverState: ServerState, connectionState: ConnectionState, socket: Socket) {
  const validationError = validateOperation(serverState, connectionState);
  if (validationError) {
    return disconnectWithError(validationError, ack, socket);
  }

  serverState[connectionState.pokerSessionId!].state = "guessing";
  serverState[connectionState.pokerSessionId!].players.forEach((p) => (p.guess = null));
}

function validateOperation(serverState: ServerState, connectionState: ConnectionState): string | null {
  if (connectionState.pokerSessionId === undefined || !serverState[connectionState.pokerSessionId]) {
    return "Session not/no longer known";
  }

  const existingPlayer = serverState[connectionState.pokerSessionId].players.find((p) => p.name === connectionState.playerName);
  if (connectionState.playerName === undefined || !existingPlayer) {
    return "Player not/no longer known";
  }

  if (existingPlayer.type !== "leader") {
    return "Only leaders can perform this operation";
  }

  return null; // success
}
