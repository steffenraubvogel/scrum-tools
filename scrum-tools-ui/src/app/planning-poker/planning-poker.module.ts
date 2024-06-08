import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BarChartComponent } from "./components/bar-chart/bar-chart.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { RadialChartComponent } from "./components/radial-chart/radial-chart.component";
import { StackChildDirective, StackComponent } from "./components/stack/stack.component";
import { ConnectionErrorComponent } from "./pages/connection-error/connection-error.component";
import { CreateSessionComponent } from "./pages/create-session/create-session.component";
import { QuickTestComponent } from "./pages/dev/quick-test/quick-test.component";
import { JoinSessionComponent } from "./pages/join-session/join-session.component";
import { SessionComponent } from "./pages/session/session.component";
import { PlanningPokerRoutingModule } from "./planning-poker-routing.module";
import { SessionSettingsService } from "./services/session-settings.service";

@NgModule({
  declarations: [
    CreateSessionComponent,
    SessionComponent,
    JoinSessionComponent,
    LoadingComponent,
    ConnectionErrorComponent,
    BarChartComponent,
    RadialChartComponent,
    QuickTestComponent,
    StackComponent,
    StackChildDirective,
  ],
  imports: [CommonModule, PlanningPokerRoutingModule, ReactiveFormsModule],
  providers: [SessionSettingsService, provideHttpClient(withInterceptorsFromDi())],
})
export class PlanningPokerModule {}
