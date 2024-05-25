import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BarChartComponent } from "./components/bar-chart/bar-chart.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { RadialChartComponent } from "./components/radial-chart/radial-chart.component";
import { StackChildDirective, StackComponent } from "./components/stack/stack.component";
import { ObfuscateDirective } from "./directives/unobfuscate.directive";
import { ConnectionErrorComponent } from "./pages/connection-error/connection-error.component";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { QuickTestComponent } from "./pages/dev/quick-test/quick-test.component";
import { ErrorComponent } from "./pages/error/error.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { LegalInfoComponent } from "./pages/legal-info/legal-info.component";
import { SessionComponent } from "./pages/session/session.component";
import { SessionSettingsService } from "./services/session-settings.service";

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
    RadialChartComponent,
    QuickTestComponent,
    LegalInfoComponent,
    ObfuscateDirective,
    StackComponent,
    StackChildDirective,
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ReactiveFormsModule],
  providers: [SessionSettingsService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
