import express from "express";
import http from "http";
import crypto from "crypto";
import cors from "cors";
import { Server } from "socket.io";
import { handleLeaderInit, handlePlayerInit } from "./event-handlers/init";
import { handleLeaderReset, handleLeaderReveal } from "./event-handlers/leader";
import { handlePlayerUpdate, revealIfAllGuessersVoted } from "./event-handlers/player";
import { ClientToServerEvents, ServerToClientEvents } from "./messages";
import { ConnectionState, ServerState } from "./session";
import { isEqual } from "lodash";
import { createLogger } from "./logging";
import { handleParticipantLeave } from "./event-handlers/participant";

// prepare configuration
const port = process.env.PORT || 4201;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:4200";

// configure and start express server
const application = express();
const httpServer = http.createServer(application);
const socketio = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [corsOrigin],
  },
});

const logger = createLogger("main");
const serverState: ServerState = {};

application.use(
  cors({
    origin: corsOrigin,
  })
);
application.use(express.static("public"));

application.get("/get-session-id", (req, res) => {
  let sessionId: string;
  do {
    const sessionNumber = crypto.randomInt(Math.pow(2, 16));
    sessionId = sessionNumber.toString(16);
  } while (serverState[sessionId]);

  logger.info("Generated session ID: " + sessionId);
  res.json(sessionId);
});

application.all("/*", function (req, res, next) {
  // required for angular routing
  res.sendFile("index.html", { root: "public" });
});

socketio.on("connection", (socket) => {
  const connectionState: ConnectionState = {
    pokerSessionId: undefined,
    playerName: undefined,
  };

  logger.info("Client connection established");

  socket.on("disconnect", () => {
    logger.info("Disconnect: pokerSessionId=" + connectionState.pokerSessionId + "; playerName=" + connectionState.playerName);

    decorateEventHandling(() => {
      if (!connectionState.pokerSessionId || !serverState[connectionState.pokerSessionId]) {
        return;
      }

      const session = serverState[connectionState.pokerSessionId];

      // mark player as disconnected
      if (connectionState.playerName) {
        const player = session.players.find((p) => p.name === connectionState.playerName);
        if (player && player.status === "connected") {
          logger.info("marking player as disconnected");
          player.status = "disconnected";
        }

        revealIfAllGuessersVoted(session);
      }

      // remove poker session if all players left
      if (session.players.every((p) => p.status !== "connected")) {
        delete serverState[connectionState.pokerSessionId];
        logger.info("deleted session with id=" + connectionState.pokerSessionId + " because all participants left");
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

  socket.on("participantLeave", (ack) => {
    logger.info("participant-leave");
    decorateEventHandling(() => handleParticipantLeave(ack, serverState, connectionState, socket));
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

httpServer.listen(+port, () => logger.info(`Server is running on port ${port}`));
