import { ClientToServerEvents, ServerToClientEvents } from "@backend/messages";
import { PokerSession } from "@backend/session";
import { ReplaySubject, Subject } from "rxjs";
import { Socket, io } from "socket.io-client";
import { SessionSettingsService } from "src/app/planning-poker/services/session-settings.service";
import { environment } from "src/environment/environment";

export class ServerCommunication {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  public state?: PokerSession;
  public state$ = new ReplaySubject<PokerSession>(1);
  public connection$ = new ReplaySubject<{
    connected: boolean;
    state: "connected" | "connecting" | "failed";
  }>(1);
  public nudged$ = new Subject<{}>();

  constructor(
    private readonly id: string,
    private readonly settingsService: SessionSettingsService,
    private readonly errorHandler: (err: string) => void
  ) {
    this.socket = io(environment.backend.socket, {
      reconnectionAttempts: 4,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      timeout: 5000,
    });

    // publish connection state
    this.connection$.next({ connected: false, state: "connecting" });
    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log("reconnect_attempt " + attempt);
      this.connection$.next({ connected: false, state: "connecting" });
    });
    this.socket.io.on("reconnect_failed", () => {
      console.log("reconnect_failed ");
      this.connection$.next({ connected: false, state: "failed" });
    });

    // handle events
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("sessionUpdate", this.onSessionUpdate.bind(this));
    this.socket.on("nudge", this.onNudge.bind(this));
    this.socket.on("disconnect", () => {
      console.log("disconnected");
    });
  }

  private onConnect() {
    this.connection$.next({ connected: true, state: "connected" });

    if (this.settingsService.settings.active === "created") {
      console.log("connect: sending leaderInit");
      this.socket.emit(
        "leaderInit",
        {
          config: { id: this.id, name: this.settingsService.settings.create!.sessionName ?? "A Poker Session" },
          player: { name: this.settingsService.settings.userName!, type: "leader" },
        },
        this.errorHandler
      );
    } else if (this.settingsService.settings.active === "joined") {
      console.log("connect: sending playerInit");
      this.socket.emit(
        "playerInit",
        {
          sessionId: this.id,
          player: { name: this.settingsService.settings.userName!, type: this.settingsService.settings.join!.role! },
        },
        this.errorHandler
      );
    }
  }

  private onSessionUpdate(newState: PokerSession) {
    console.log("session-update"); //, newState); // do not make it too easy to view other's votes
    this.state = newState;
    this.state$.next(newState);
  }

  private onNudge() {
    console.log("nudge received");
    if (this.state?.state === "guessing") {
      const me = this.state.players.find((p) => p.name === this.settingsService.settings.userName!);
      if (me?.guess === null) {
        this.nudged$.next({});
      }
    }
  }

  public reveal() {
    this.socket.emit("leaderReveal", this.errorHandler);
  }

  public reset() {
    this.socket.emit("leaderReset", this.errorHandler);
  }

  public nudge() {
    this.socket.emit("leaderNudge", this.errorHandler);
  }

  public guess(value: number) {
    this.socket.emit("playerUpdate", { guess: value }, this.errorHandler);
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket
        .timeout(2000)
        .emitWithAck("participantLeave")
        .catch((err) => {
          console.warn("Announcing leave was acknowledged with error from server: ", err);
        })
        .finally(() => {
          console.log("Disconnecting socket.");
          this.socket.disconnect();
        });
    }
  }
}
