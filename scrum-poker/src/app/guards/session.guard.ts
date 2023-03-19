import { Injectable } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { SessionSettingsService } from "../services/session-settings.service";

@Injectable()
export class SessionGuard {
  constructor(private readonly router: Router, private readonly settingsService: SessionSettingsService) {}

  canActivate(): boolean | UrlTree {
    if (!this.settingsService.settings.active) {
      return this.router.createUrlTree(["/"]);
    }
    return true;
  }
}
