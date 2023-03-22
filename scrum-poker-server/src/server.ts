import express from "express";
import http from "http";
import { Server } from "socket.io";
import { handleLeaderInit, handlePlayerInit } from "./event-handlers/init";
import { handleLeaderReset, handleLeaderReveal } from "./event-handlers/leader";
import { handlePlayerUpdate } from "./event-handlers/player";
import { ClientToServerEvents, ServerToClientEvents } from "./messages";
import { ConnectionState, ServerState } from "./session";
import { isEqual } from "lodash";
import { createLogger } from "./logging";

const application = express();
const httpServer = http.createServer(application);
const socketio = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ["http://localhost:4200"],
  },
});

const logger = createLogger("main");
const serverState: ServerState = {};

socketio.on("connection", (socket) => {
  const connectionState: ConnectionState = {
    pokerSessionId: undefined,
    playerName: undefined,
  };

  logger.info("Client connection established");

  socket.on("disconnect", () => {
    logger.info("Disconnect: pokerSessionId=" + connectionState.pokerSessionId + "; playerName=" + connectionState.playerName);

    decorateEventHandling(() => {
      // mark player as disconnected
      if (connectionState.pokerSessionId && connectionState.playerName && serverState[connectionState.pokerSessionId]) {
        const player = serverState[connectionState.pokerSessionId].players.find((p) => p.name === connectionState.playerName);
        if (player) {
          logger.info("marking player as disconnected");
          player.status = "disconnected";
        }
      }

      // remove poker session if all players left
      if (connectionState.pokerSessionId && serverState[connectionState.pokerSessionId]) {
        if (serverState[connectionState.pokerSessionId].players.every((p) => p.status === "disconnected")) {
          delete serverState[connectionState.pokerSessionId];
          logger.info("deleted session with id=" + connectionState.pokerSessionId + " because all participants left");
        }
      }
    });
  });

  socket.on("leaderInit", (msg, ack) => {
    logger.info("leader-init: ", msg);
    decorateEventHandling(() => handleLeaderInit(msg, ack, serverState, connectionState, socket));
  });

  socket.on("playerInit", (msg, ack) => {
    logger.info("player-init: ", msg);
    decorateEventHandling(() => handlePlayerInit(msg, ack, serverState, connectionState, socket));
  });

  socket.on("playerUpdate", (msg, ack) => {
    logger.info("player-update: ", msg);
    decorateEventHandling(() => handlePlayerUpdate(msg, ack, serverState, connectionState, socket));
  });

  socket.on("leaderReveal", (ack) => {
    logger.info("leader-reveal");
    decorateEventHandling(() => handleLeaderReveal(ack, serverState, connectionState, socket));
  });

  socket.on("leaderReset", (ack) => {
    logger.info("leader-reset");
    decorateEventHandling(() => handleLeaderReset(ack, serverState, connectionState, socket));
  });

  function decorateEventHandling(action: () => void) {
    try {
      const prevSessionState = connectionState.pokerSessionId ? structuredClone(serverState[connectionState.pokerSessionId]) : undefined;

      action();

      const newSessionState = connectionState.pokerSessionId ? serverState[connectionState.pokerSessionId] : undefined;

      if (newSessionState && !isEqual(prevSessionState, newSessionState)) {
        logger.info("session-update: id=" + connectionState.pokerSessionId + "; ", serverState[connectionState.pokerSessionId!]);
        socketio.to(connectionState.pokerSessionId!).emit("sessionUpdate", serverState[connectionState.pokerSessionId!]);
      }
    } catch (err) {
      logger.error("An error occurred in an event handler", err);
    }
  }
});

const port = process.env.PORT || 4201;
httpServer.listen(port, () => logger.info(`Server is running on port ${port}`));
