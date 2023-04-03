import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Player } from "@backend/session";
import { filter, map, Subscription, tap } from "rxjs";
import { SessionSettingsService } from "src/app/services/session-settings.service";
import { ServerCommunication } from "./server-communication";
import { ChartDataPoint } from "src/app/components/bar-chart/bar-chart.component";

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
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 8, label: "8" },
    { value: 13, label: "13" },
    { value: 21, label: "21" },
    { value: -1, label: "Abstain" },
  ];
  public playersGuess: number | null = null;
  public chartData: ChartDataPoint[] = [];

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, public readonly settingsService: SessionSettingsService) {}

  public ngOnInit() {
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
              filter((p) => this.playersGuess !== null && p?.guess === null)
            )
            .subscribe(() => {
              // resets the vote input when the leader resets all votes
              this.playersGuess = null;
            })
        );

        this.subs.add(
          this.session.connection$.pipe(filter((con) => con.state === "failed")).subscribe(() => {
            // redirect to connection error page
            this.router.navigate(["connection-error"], { skipLocationChange: true });
          })
        );
      })
    );
  }

  public ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.session) {
      this.session.disconnect();
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  public beforeUnloadHandler(_: Event) {
    // this allows a graceful disconnect with "I am leaving" message to server when the browser or tab
    // is closed gracefully or the page is navigating to another site
    if (this.session) {
      this.session.disconnect();
    }
  }

  public copyJoinLink() {
    const joinUrl = window.location.protocol + "//" + window.location.host + "/join/" + this.session!.state!.id;
    navigator.clipboard.writeText(joinUrl);
  }

  public cannotReveal(): boolean | null {
    return this.session!.state!.state === "revealed" ||
      this.session!.state!.players.filter((p) => p.status === "connected" && p.type === "guesser").length === 0
      ? true
      : null;
  }

  public vote(guess: number) {
    this.playersGuess = guess;
    this.session!.guess(guess);
  }

  public playersByRole(role: Player["type"]) {
    return this.session!.state!.players.filter((p) => p.type === role).sort((a, b) => NAME_COMPARATOR(a.name, b.name));
  }

  public isOwnPlayer(p: Player) {
    return p.name === this.settingsService.settings.userName;
  }

  public isConsesus() {
    const relevant = this.session!.state!.players.filter((p) => p.guess !== null && p.guess > 0).map((p) => p.guess!);
    return relevant.length > 0 && relevant.every((g) => g === relevant[0]);
  }

  public getAverageGuess() {
    const relevant = this.session!.state!.players.filter((p) => p.guess !== null && p.guess > 0).map((p) => p.guess!);
    const average = relevant.reduce((prev, cur) => prev + cur, 0) / Math.max(relevant.length, 1);
    return average.toLocaleString("en-US", { maximumFractionDigits: 1 });
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
      x: row.guess,
      y: row.count,
      tooltip: this.session!.state!.players.filter((p) => `${p.guess}` === row.guess)
        .map((p) => p.name)
        .sort(NAME_COMPARATOR)
        .join(", "),
      color: row.guess === "?" ? "var(--sp-chart-color-abstained)" : `var(--sp-chart-color-${row.guess})`,
    }));
  }

  private handleErrorFromServer(err: string) {
    console.error("Server responded with an error:", err);
    this.router.navigate(["/error"], { skipLocationChange: true });
  }
}
