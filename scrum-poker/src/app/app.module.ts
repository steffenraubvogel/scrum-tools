import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SessionGuard } from "./guards/session.guard";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { ErrorComponent } from "./pages/error/error.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { SessionComponent } from "./pages/session/session.component";
import { SessionSettingsService } from "./services/session-settings.service";
import { LoadingComponent } from "./components/loading/loading.component";
import { ConnectionErrorComponent } from "./pages/connection-error/connection-error.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { BarChartComponent } from "./components/bar-chart/bar-chart.component";
import { QuickTestComponent } from "./pages/dev/quick-test/quick-test.component";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    CreateSessionComponent,
    SessionComponent,
    JoinSessionComponent,
    ErrorComponent,
    LoadingComponent,
    ConnectionErrorComponent,
    FooterComponent,
    HeaderComponent,
    BarChartComponent,
    QuickTestComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ReactiveFormsModule, HttpClientModule],
  providers: [SessionSettingsService, SessionGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
