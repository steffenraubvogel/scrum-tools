import { Component } from "@angular/core";
import { ObfuscateDirective } from "./unobfuscate.directive";

@Component({
  selector: "app-legal-info",
  imports: [ObfuscateDirective],
  templateUrl: "./legal-info.component.html",
})
export class LegalInfoComponent {}
