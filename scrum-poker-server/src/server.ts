import express from "express";
import compression from "compression";
import http from "http";
import crypto from "crypto";
import cors from "cors";
import { Server } from "socket.io";
import { handleLeaderInit, handlePlayerInit } from "./event-handlers/init";
import { handleLeaderNudge, handleLeaderReset, handleLeaderReveal } from "./event-handlers/leader";
import { handlePlayerUpdate, revealIfAllGuessersVoted } from "./event-handlers/player";
import { ClientToServerEvents, ServerToClientEvents } from "./messages";
import { ConnectionState, ServerState } from "./session";
import { isEqual } from "lodash";
import { createLogger } from "./logging";
import { handleParticipantLeave } from "./event-handlers/participant";

// prepare configuration
const hostname = process.env.SP_HOSTNAME || "127.0.0.1";
const port = process.env.SP_PORT || 4201;
const corsOrigin = process.env.SP_CORS_ORIGIN || "http://localhost:4200";

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

logger.info(`Starting application (arch=${process.arch}; platform=${process.platform}; pid=${process.pid}; nodejs version=${process.version})`);

application.use(compression());
application.use(
  cors({
    origin: corsOrigin,
  })
);
application.use(express.static("public"));

application.get("/get-session-id", (req, res) => {
  let sessionId: string;
  const lastId = req.query.lastId;
  if (typeof lastId === "string" && lastId && lastId.length <= 16 && !serverState[lastId]) {
    sessionId = lastId;
  } else {
    do {
      const sessionNumber = crypto.randomInt(Math.pow(2, 16));
      sessionId = sessionNumber.toString(16);
    } while (serverState[sessionId]);
  }

  logger.info("Determined session ID: " + sessionId);
  res.json(sessionId);
});

application.get("/health", (req, res) => {
  // when deployed, verfies the application is alive
  res.send("ok");
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

  logEvent("connection established", undefined, "?");

  socket.on("disconnect", () => {
    logEvent("disconnect");

    decorateEventHandling(() => {
      if (!connectionState.pokerSessionId || !serverState[connectionState.pokerSessionId]) {
        return;
      }

      const session = serverState[connectionState.pokerSessionId];

      // mark player as disconnected
      if (connectionState.playerName) {
        const player = session.players.find((p) => p.name === connectionState.playerName);
        if (player && player.status === "connected") {
          logEvent("marking player as disconnected");
          player.status = "disconnected";
        }

        revealIfAllGuessersVoted(session);
      }

      // remove poker session if all players left
      if (session.players.every((p) => p.status !== "connected")) {
        delete serverState[connectionState.pokerSessionId];
        logEvent("deleted session because all participants left");
      }
    });
  });

  socket.on("leaderInit", (msg, ack) => {
    logEvent("leader-init", msg, msg.config.id);
    decorateEventHandling(() => handleLeaderInit(msg, ack, serverState, connectionState, socket));
  });

  socket.on("playerInit", (msg, ack) => {
    logEvent("player-init", msg, msg.sessionId);
    decorateEventHandling(() => handlePlayerInit(msg, ack, serverState, connectionState, socket));
  });

  socket.on("playerUpdate", (msg, ack) => {
    logEvent("player-update", msg);
    decorateEventHandling(() => handlePlayerUpdate(msg, ack, serverState, connectionState, socket));
  });

  socket.on("leaderReveal", (ack) => {
    logEvent("leader-reveal");
    decorateEventHandling(() => handleLeaderReveal(ack, serverState, connectionState, socket));
  });

  socket.on("leaderReset", (ack) => {
    logEvent("leader-reset");
    decorateEventHandling(() => handleLeaderReset(ack, serverState, connectionState, socket));
  });

  socket.on("leaderNudge", (ack) => {
    logEvent("leader-nudge");
    decorateEventHandling(() => handleLeaderNudge(ack, serverState, connectionState, socket, socketio));
  });

  socket.on("participantLeave", (ack) => {
    logEvent("participant-leave");
    decorateEventHandling(() => handleParticipantLeave(ack, serverState, connectionState, socket));
  });

  function logEvent(event: string, params?: any, sessionIdOverride?: string) {
    logger.debug("[" + (connectionState.pokerSessionId ?? sessionIdOverride) + "][" + socket.id + "] " + event);
    if (params) {
      logger.trace("Message:", params);
    }
  }

  function decorateEventHandling(action: () => void) {
    try {
      const prevSessionState = connectionState.pokerSessionId ? structuredClone(serverState[connectionState.pokerSessionId]) : undefined;

      action();

      const newSessionState = connectionState.pokerSessionId ? serverState[connectionState.pokerSessionId] : undefined;

      if (newSessionState && !isEqual(prevSessionState, newSessionState)) {
        logEvent("session-update", serverState[connectionState.pokerSessionId!]);
        socketio.to(connectionState.pokerSessionId!).emit("sessionUpdate", serverState[connectionState.pokerSessionId!]);
      }
    } catch (err) {
      logger.error("An error occurred in an event handler", err);
    }
  }
});

httpServer.listen(+port, hostname, () => logger.info(`Server is running on port ${hostname}:${port}`));
