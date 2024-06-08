import { Player, PokerSession, PokerSessionConfig } from "./session";

export type LeaderInitMessage = {
  config: PokerSessionConfig;
  player: Pick<Player, "name" | "type">;
};

export type PlayerInitMessage = {
  sessionId: string;
  player: Pick<Player, "name" | "type">;
};

export type PlayerUpdateMessage = {
  guess: Player["guess"];
};

export interface ServerToClientEvents {
  sessionUpdate: (session: PokerSession) => void;
  nudge: () => void;
}

export interface ClientToServerEvents {
  leaderInit: (msg: LeaderInitMessage, ack: (err: string) => void) => void;
  playerInit: (msg: PlayerInitMessage, ack: (err: string) => void) => void;
  playerUpdate: (msg: PlayerUpdateMessage, ack: (err: string) => void) => void;
  leaderReveal: (ack: (err: string) => void) => void;
  leaderReset: (ack: (err: string) => void) => void;
  leaderNudge: (ack: (err: string) => void) => void;
  participantLeave: (ack: (err: string) => void) => void;
}
