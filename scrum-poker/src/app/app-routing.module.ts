import { inject, NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SessionGuard } from "./guards/session.guard";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { ErrorComponent } from "./pages/error/error.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { SessionComponent } from "./pages/session/session.component";

const routes: Routes = [
  { path: "", pathMatch: "full", component: CreateSessionComponent },
  {
    path: "session/:id",
    component: SessionComponent,
    canActivate: [() => inject(SessionGuard).canActivate()],
  },
  { path: "join/:id", component: JoinSessionComponent },
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "/" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}