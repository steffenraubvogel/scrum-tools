import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../messages";
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

export function handleLeaderNudge(
  ack: (err: string) => void,
  serverState: ServerState,
  connectionState: ConnectionState,
  socket: Socket,
  socketio: Server<ClientToServerEvents, ServerToClientEvents>
) {
  const validationError = validateOperation(serverState, connectionState);
  if (validationError) {
    return disconnectWithError(validationError, ack, socket);
  }

  // NOTE: throttling in case of abuse would be useful but the clients are already throttling on their own
  // and other status updates could also be a problem; need to handle this in a central place

  if (serverState[connectionState.pokerSessionId!].state === "guessing") {
    const playersToNudge = serverState[connectionState.pokerSessionId!].players.filter((p) => p.type === "guesser" && p.guess === null);
    for (let player of playersToNudge) {
      socketio.to(connectionState.pokerSessionId! + "#" + player.name).emit("nudge");
    }
  }
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
