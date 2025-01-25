import { Routes } from "@angular/router";
import { ErrorComponent } from "./error/error.component";
import { LegalInfoComponent } from "./legal-info/legal-info.component";
import { OverviewComponent } from "./overview/overview.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", component: OverviewComponent },
  { path: "error", component: ErrorComponent },
  { path: "legal", component: LegalInfoComponent },
  { path: "planning-poker", loadChildren: () => import("./planning-poker/planning-poker.module").then((m) => m.PlanningPokerModule) },
  { path: "wheel-of-names", loadChildren: () => import("./wheel-of-names/wheel-of-names.component").then((m) => m.ROUTES) },
  { path: "**", redirectTo: "/" },
];
