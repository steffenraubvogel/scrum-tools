import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionSettingsService } from "../services/session-settings.service";

export const sessionGuard = (() => {
  const settingsService = inject(SessionSettingsService);
  const router = inject(Router);

  if (!settingsService.settings.active) {
    return router.createUrlTree(["/"]);
  }
  return true;
}) satisfies CanActivateFn;
