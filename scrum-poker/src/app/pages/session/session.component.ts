import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Player } from "@backend/session";
import { filter, map, Subscription, tap } from "rxjs";
import { SessionSettingsService } from "src/app/services/session-settings.service";
import { ServerCommunication } from "./server-communication";

const NAME_COMPARATOR = Intl.Collator().compare;

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

        this.subs.add(
          this.session.state$
            .pipe(
              tap((_) => this.calculateChartData()),
              map((s) => s.players.find((p) => p.name === this.settingsService.settings.userName)),
              filter((p) => this.playersGuess.value !== null && p?.guess === null)
            )
            .subscribe(() => {
              // resets the vote input when the leader reset all votes
              this.playersGuess.patchValue(null);
            })
        );
      })
    );

    this.subs.add(
      this.playersGuess.valueChanges.subscribe((guess) => {
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
    return this.session!.state!.players.filter((p) => p.type === role).sort((a, b) => NAME_COMPARATOR(a.name, b.name));
  }

  public guessCountTable() {
    const map: { [guess: string]: number } = {};
    this.session!.state!.players.forEach((p) => {
      if (p.guess !== null) {
        map[`${p.guess}`] = (map[`${p.guess}`] ?? 0) + 1;
      }
    });

    return Object.keys(map)
      .sort((a, b) => {
        if (a === "-1") {
          return b === "-1" ? 0 : 1;
        }
        if (b === "-1") {
          return -1;
        }
        const numA: number = Number(a);
        const numB: number = Number(b);
        return numA - numB;
      })
      .map((guess) => ({
        guess: guess === "-1" ? "?" : guess,
        count: map[guess],
      }));
  }

  private calculateChartData() {
    this.chartData = this.guessCountTable().map((row) => ({
      name: row.guess,
      value: row.count,
      extra: {
        voters: this.session!.state!.players.filter((p) => `${p.guess}` === row.guess)
          .map((p) => p.name)
          .sort(NAME_COMPARATOR),
      },
    }));
  }

  public chartData: { name: string; value: number; extra: { voters: string[] } }[] = [
    {
      name: "2",
      value: 2,
      extra: {
        voters: ["Me1", "Him", "Her"],
      },
    },
    {
      name: "3",
      value: 1,
      extra: {
        voters: ["One"],
      },
    },
    {
      name: "8",
      value: 3,
      extra: {
        voters: ["Two"],
      },
    },
  ];

  public chartYAxisFormat(val: number) {
    if (val % 1 === 0) {
      return val.toLocaleString();
    } else {
      return "";
    }
  }

  public formatVoters(model: { extra: { voters: string[] } }) {
    return model.extra.voters.join(", ");
  }

  private handleErrorFromServer(err: string) {
    console.error("Server responded with an error:", err);
    this.router.navigate(["/error"], { skipLocationChange: true });
  }
}
