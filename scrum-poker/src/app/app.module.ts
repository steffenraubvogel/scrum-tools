import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { SessionComponent } from "./pages/session/session.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { SessionSettingsService } from "./services/session-settings.service";
import { SessionGuard } from "./guards/session.guard";
import { ErrorComponent } from './pages/error/error.component';

@NgModule({
  declarations: [AppComponent, CreateSessionComponent, SessionComponent, JoinSessionComponent, ErrorComponent],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [SessionSettingsService, SessionGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
