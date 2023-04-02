import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SessionSettingsService } from "src/app/services/session-settings.service";

@Component({
  selector: "app-join-session",
  templateUrl: "./join-session.component.html",
  styleUrls: ["./join-session.component.scss"],
})
export class JoinSessionComponent implements OnInit, OnDestroy {
  private subs: Subscription = new Subscription();
  public formGroup = new FormGroup({
    userName: new FormControl("", Validators.required),
    role: new FormControl("", Validators.required),
  });
  private sessionId: string = "";

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly settingsService: SessionSettingsService) {
    this.formGroup.controls.userName.patchValue(settingsService.settings.userName);
    this.formGroup.controls.role.patchValue(settingsService.settings.join?.role ?? null);
  }

  public ngOnInit(): void {
    this.subs.add(
      this.route.params.subscribe((params) => {
        this.sessionId = params["id"];
      })
    );
  }

  public ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public onSubmit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.valid) {
      const val = this.formGroup.value;
      this.settingsService.remember({
        userName: val.userName,
        join: {
          role: (val.role ?? "guesser") as "guesser" | "observer",
        },
        active: "joined",
      });

      this.router.navigate(["/session", this.sessionId]);
    }
  }
}
