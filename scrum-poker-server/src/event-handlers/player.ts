import { Socket } from "socket.io";
import { PlayerUpdateMessage } from "../messages";
import { ConnectionState, ServerState } from "../session";
import { disconnectWithError } from "./common";

export function handlePlayerUpdate(
  msg: PlayerUpdateMessage,
  ack: (err: string) => void,
  serverState: ServerState,
  connectionState: ConnectionState,
  socket: Socket
) {
  if (connectionState.pokerSessionId === undefined || !serverState[connectionState.pokerSessionId]) {
    return disconnectWithError("Session not/no longer known", ack, socket);
  }

  const session = serverState[connectionState.pokerSessionId];
  const existingPlayer = session.players.find((p) => p.name === connectionState.playerName);
  if (connectionState.playerName === undefined || !existingPlayer) {
    return disconnectWithError("Player not/no longer known", ack, socket);
  }

  if (existingPlayer.type !== "guesser") {
    return disconnectWithError("Only guessers can vote", ack, socket);
  }

  existingPlayer.guess = msg.guess;

  // if all relevant players voted, reveal the result
  if (session.players.every((p) => p.type !== "guesser" || p.guess !== null)) {
    session.state = "revealed";
  }
}
