import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { environment } from "src/environment/environment";
import { sessionGuard } from "./guards/session.guard";
import { ConnectionErrorComponent } from "./pages/connection-error/connection-error.component";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { QuickTestComponent } from "./pages/dev/quick-test/quick-test.component";
import { ErrorComponent } from "./pages/error/error.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { LegalInfoComponent } from "./pages/legal-info/legal-info.component";
import { SessionComponent } from "./pages/session/session.component";

const routes: Routes = [
  { path: "", pathMatch: "full", component: CreateSessionComponent },
  {
    path: "session/:id",
    component: SessionComponent,
    canActivate: [sessionGuard],
  },
  { path: "join/:id", component: JoinSessionComponent },
  { path: "legal", component: LegalInfoComponent },
  { path: "error", component: ErrorComponent },
  { path: "connection-error", component: ConnectionErrorComponent },
  { path: "dev", canActivate: [() => !environment.production], children: [{ path: "quick-test", component: QuickTestComponent }] },
  { path: "**", redirectTo: "/" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
