import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";

@Component({
  selector: "app-root",
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {}
