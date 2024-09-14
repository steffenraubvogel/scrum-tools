import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { SessionSettingsService } from "src/app/planning-poker/services/session-settings.service";
import { environment } from "src/environment/environment";

@Component({
  selector: "app-create-session",
  templateUrl: "./create-session.component.html",
})
export class CreateSessionComponent {
  public formGroup = new FormGroup({
    userName: new FormControl("", Validators.required),
    sessionName: new FormControl(""),
  });

  public submitting: boolean = false;

  constructor(private readonly router: Router, private readonly settingsService: SessionSettingsService, private readonly httpClient: HttpClient) {
    this.formGroup.controls.userName.patchValue(settingsService.settings.userName);
    this.formGroup.controls.sessionName.patchValue(settingsService.settings.create?.sessionName ?? null);
  }

  public onSubmit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.valid) {
      const val = this.formGroup.value;
      this.settingsService.remember({
        userName: val.userName,
        create: {
          sessionName: val.sessionName ?? null,
          lastSessionId: this.settingsService.settings.create?.lastSessionId ?? null,
        },
        active: "created",
      });

      const params: { [param: string]: string } = {};
      if (this.settingsService.settings.create?.lastSessionId) {
        // the server will try to use this session ID if available
        params["lastId"] = this.settingsService.settings.create?.lastSessionId;
        params["leaderName"] = this.settingsService.settings.userName!;
      }

      this.submitting = true;
      this.httpClient
        .get<string>(`${environment.backend.api}/get-session-id`, { params })
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (sessionId) => {
            this.router.navigate(["/planning-poker/session", sessionId]);

            // remember the session ID for next time to have durable URLs for join
            // this is for convenience of the users
            this.settingsService.remember({
              create: {
                ...this.settingsService.settings.create!,
                lastSessionId: sessionId,
              },
            });
          },
          error: (err) => {
            console.error("Couldn't get a new session ID", err);
            this.router.navigate(["/error"]);
          },
        });
    }
  }
}
