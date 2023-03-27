import { Component } from "@angular/core";

@Component({
  selector: "app-connection-error",
  templateUrl: "./connection-error.component.html",
  styleUrls: ["./connection-error.component.scss"],
})
export class ConnectionErrorComponent {
  public getRetryRoute() {
    return [window.location.pathname];
  }
}
