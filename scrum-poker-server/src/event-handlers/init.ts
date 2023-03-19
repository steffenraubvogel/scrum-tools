import { Socket } from "socket.io";
import { LeaderInitMessage, PlayerInitMessage } from "../messages";
import { ConnectionState, ServerState } from "../session";

export function handleLeaderInit(
  msg: LeaderInitMessage,
  ack: (err: string) => void,
  serverState: ServerState,
  connectionState: ConnectionState,
  socket: Socket
) {
  if (msg.player.type !== "leader") {
    return ack("Player type mismatching leader-init event");
  }

  if (!validatePlayerName(msg.player.name)) {
    return ack("Player name invalid");
  }

  // merge session
  const existingSession = serverState[msg.config.id];
  if (existingSession) {
    // TODO
  } else {
    serverState[msg.config.id] = {
      ...msg.config,
      state: "guessing",
      players: [{ ...msg.player, status: "connected", guess: NaN }],
    };
  }

  socket.join(msg.config.id);

  connectionState.pokerSessionId = msg.config.id;
  connectionState.playerName = msg.player.name;
}

export function handlePlayerInit(
  msg: PlayerInitMessage,
  ack: (err: string) => void,
  serverState: ServerState,
  connectionState: ConnectionState,
  socket: Socket
) {
  if (msg.player.type === "leader") {
    return ack("Player type mismatching player-init event");
  }

  if (!validatePlayerName(msg.player.name)) {
    return ack("Player name invalid");
  }

  // merge into players
  if (serverState[msg.sessionId]) {
    const players = serverState[msg.sessionId].players;
    const existingPlayer = players.find((p) => p.name === msg.player.name);
    if (existingPlayer) {
      if (existingPlayer.type === "leader") {
        return ack("Leader has same name");
      }
      // update player
      existingPlayer.type = msg.player.type;
      existingPlayer.status = "connected";
      existingPlayer.guess = NaN;
    } else {
      // add player
      players.push({ ...msg.player, status: "connected", guess: NaN });
    }
  } else {
    return ack("Poker session does not exist.");
  }

  socket.join(msg.sessionId);

  connectionState.pokerSessionId = msg.sessionId;
  connectionState.playerName = msg.player.name;
}

function validatePlayerName(playerName: string) {
  return !!playerName;
}
