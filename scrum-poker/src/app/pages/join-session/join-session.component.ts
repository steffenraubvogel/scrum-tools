import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SessionSettingsService } from "src/app/services/session-settings.service";

@Component({
  selector: "app-join-session",
  templateUrl: "./join-session.component.html",
  styleUrls: ["./join-session.component.scss"],
})
export class JoinSessionComponent {
  public formGroup = new FormGroup({
    userName: new FormControl("", Validators.required),
    role: new FormControl("", Validators.required),
  });

  constructor(private readonly router: Router, private readonly settingsService: SessionSettingsService) {
    this.formGroup.controls.userName.patchValue(settingsService.settings.userName);
    this.formGroup.controls.role.patchValue(settingsService.settings.join?.role ?? null);
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

      const sessionId = "xyz";
      this.router.navigate(["/session", sessionId]);
    }
  }
}
