import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionSettings, SessionSettingsService } from "src/app/services/session-settings.service";

@Component({
  selector: "app-quick-test",
  templateUrl: "./quick-test.component.html",
})
export class QuickTestComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, private readonly router: Router, public readonly settingsService: SessionSettingsService) {}

  public ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParams["sessionId"];
    const settings = JSON.parse(this.route.snapshot.queryParams["settings"]) as SessionSettings;

    console.log("Quick test page referenced with sessionId " + sessionId + " and settings: ", settings);

    this.settingsService.remember(settings);
    this.router.navigate(["session", sessionId]);
  }
}
