import { PlayerUpdateMessage } from "../messages";
import { ConnectionState, ServerState } from "../session";

export function handlePlayerUpdate(msg: PlayerUpdateMessage, ack: (err: string) => void, serverState: ServerState, connectionState: ConnectionState) {
  if (connectionState.pokerSessionId === undefined || !serverState[connectionState.pokerSessionId]) {
    return ack("Session not/no longer known");
  }

  const session = serverState[connectionState.pokerSessionId];
  const existingPlayer = session.players.find((p) => p.name === connectionState.playerName);
  if (connectionState.playerName === undefined || !existingPlayer) {
    return ack("Player not/no longer known");
  }

  if (existingPlayer.type !== "guesser") {
    return ack("Only guessers can vote");
  }

  existingPlayer.guess = msg.guess;

  // if all relevant players voted, reveal the result
  if (session.players.every((p) => p.type !== "guesser" || p.guess >= -1)) {
    session.state = "revealed";
  }
}
