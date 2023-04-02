import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SessionSettingsService } from "src/app/services/session-settings.service";
import { environment } from "src/environment/environment";

@Component({
  selector: "app-create-session",
  templateUrl: "./create-session.component.html",
  styleUrls: ["./create-session.component.scss"],
})
export class CreateSessionComponent {
  public formGroup = new FormGroup({
    userName: new FormControl("", Validators.required),
    sessionName: new FormControl(""),
  });

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
        },
        active: "created",
      });

      this.httpClient.get(`${environment.backend.api}/get-session-id`).subscribe({
        next: (sessionId) => {
          this.router.navigate(["/session", sessionId]);
        },
        error: (err) => {
          console.error("Couldn't get a new session ID", err);
          this.router.navigate(["/error"]);
        },
      });
    }
  }
}
