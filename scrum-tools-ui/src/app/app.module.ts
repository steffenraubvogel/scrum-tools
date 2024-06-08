import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { ErrorComponent } from "./error/error.component";
import { LegalInfoComponent } from "./legal-info/legal-info.component";
import { ObfuscateDirective } from "./legal-info/unobfuscate.directive";
import { OverviewComponent } from "./overview/overview.component";

@NgModule({
  declarations: [AppComponent, ErrorComponent, FooterComponent, HeaderComponent, LegalInfoComponent, ObfuscateDirective, OverviewComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
})
export class AppModule {}
