import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { io, Socket } from "socket.io-client";
import { environment } from "src/environment/environment";
import { ServerToClientEvents, ClientToServerEvents } from "@backend/messages";
import { Player, PokerSession } from "@backend/session";
import { SessionSettingsService } from "src/app/services/session-settings.service";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit, OnDestroy {
  private subs: Subscription = new Subscription();
  public session?: ServerCommunication;
  public guessOptions: { value: number; label: string }[] = [
    { value: -1, label: "Abstain" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 8, label: "8" },
    { value: 13, label: "13" },
    { value: 21, label: "21" },
  ];
  public playersGuess = new FormControl<number | null>(null);

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, public readonly settingsService: SessionSettingsService) {}

  ngOnInit() {
    this.subs.add(
      this.route.params.subscribe((params) => {
        const id = params["id"];
        if (this.session) {
          this.session.disconnect();
        }
        this.session = new ServerCommunication(id, this.settingsService, this.handleErrorFromServer.bind(this));
      })
    );

    this.subs.add(
      this.playersGuess.valueChanges.subscribe((guess) => {
        console.log("Vote: " + guess);
        if (guess !== null) {
          this.session!.guess(guess);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.session) {
      this.session.disconnect();
    }
  }

  public copyJoinLink() {
    const joinUrl = window.location.protocol + "//" + window.location.host + "/join/" + this.session!.state!.id;
    navigator.clipboard.writeText(joinUrl);
  }

  public playersByRole(role: Player["type"]) {
    return this.session!.state!.players.filter((p) => p.type === role);
  }

  private handleErrorFromServer(err: string) {
    console.error("Server responded with an error:", err);
    this.router.navigate(["/error"], { skipLocationChange: true });
  }
}

class ServerCommunication {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  public state?: PokerSession;

  constructor(
    private readonly id: string,
    private readonly settingsService: SessionSettingsService,
    private readonly errorHandler: (err: string) => void
  ) {
    this.socket = io(environment.backend.socket);

    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("sessionUpdate", this.onSessionUpdate.bind(this));
  }

  private onConnect() {
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
    console.log("session-update: ", newState);
    this.state = newState;
  }

  public reveal() {
    this.socket.emit("leaderReveal", this.errorHandler);
  }

  public reset() {
    this.socket.emit("leaderReset", this.errorHandler);
  }

  public guess(value: number) {
    this.socket.emit("playerUpdate", { guess: value }, this.errorHandler);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
