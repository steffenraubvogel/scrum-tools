export type ServerState = {
  [id: string]: PokerSession;
};

export type ConnectionState = {
  pokerSessionId?: string;
  playerName?: string;
};

export type Player = {
  type: "leader" | "observer" | "guesser";
  name: string;
  guess: number | null;
  status: "disconnected" | "left" | "connected";
};

export type PokerSessionConfig = {
  id: string;
  name: string;
};

export type PokerSession = PokerSessionConfig & {
  state: "guessing" | "revealed";
  players: Player[];
};
