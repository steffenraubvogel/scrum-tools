import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SessionGuard } from "./guards/session.guard";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { ErrorComponent } from "./pages/error/error.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { SessionComponent } from "./pages/session/session.component";
import { SessionSettingsService } from "./services/session-settings.service";

@NgModule({
  declarations: [AppComponent, CreateSessionComponent, SessionComponent, JoinSessionComponent, ErrorComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ReactiveFormsModule, NgxChartsModule],
  providers: [SessionSettingsService, SessionGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
