import { Socket } from "socket.io";
import { LeaderInitMessage, PlayerInitMessage } from "../messages";
import { ConnectionState, ServerState } from "../session";
import { disconnectWithError } from "./common";

export function handleLeaderInit(
  msg: LeaderInitMessage,
  ack: (err: string) => void,
  serverState: ServerState,
  connectionState: ConnectionState,
  socket: Socket
) {
  if (msg.player.type !== "leader") {
    return disconnectWithError("Player type mismatching leader-init event", ack, socket);
  }

  if (!validatePlayerName(msg.player.name)) {
    return disconnectWithError("Player name invalid", ack, socket);
  }

  // merge session
  const existingSession = serverState[msg.config.id];
  if (existingSession) {
    const existingLeader = existingSession.players.find((p) => p.type === "leader");
    if (!existingLeader || existingLeader.name !== msg.player.name) {
      return disconnectWithError("Existing leader mismatch", ack, socket);
    }
    existingLeader.status = "connected";
  } else {
    serverState[msg.config.id] = {
      ...msg.config,
      state: "guessing",
      players: [{ ...msg.player, status: "connected", guess: null }],
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
    return disconnectWithError("Player type mismatching player-init event", ack, socket);
  }

  if (!validatePlayerName(msg.player.name)) {
    return disconnectWithError("Player name invalid", ack, socket);
  }

  // merge into players
  const sessionState = serverState[msg.sessionId];
  if (!sessionState) {
    return disconnectWithError("Poker session does not exist.", ack, socket);
  }

  const players = sessionState.players;
  const existingPlayer = players.find((p) => p.name === msg.player.name);
  if (existingPlayer) {
    if (existingPlayer.type === "leader") {
      return disconnectWithError("Leader has same name", ack, socket);
    }
    // update player
    existingPlayer.type = msg.player.type;
    existingPlayer.status = "connected";
    existingPlayer.guess = null;
  } else {
    // add player
    players.push({ ...msg.player, status: "connected", guess: null });

    // hide guesses if already revealed: if a guesser joins late, this gives them
    // a chance to vote without seeing other's votes
    sessionState.state = "guessing";
  }

  // join session room and player individual room
  socket.join([msg.sessionId, msg.sessionId + "#" + msg.player.name]);

  connectionState.pokerSessionId = msg.sessionId;
  connectionState.playerName = msg.player.name;
}

function validatePlayerName(playerName: string) {
  return !!playerName;
}
