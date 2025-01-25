import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BehaviorSubject, delay } from "rxjs";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"],
  standalone: false,
})
export class LoadingComponent implements OnChanges {
  @Input()
  public show: boolean = false;

  private _show$ = new BehaviorSubject(false);
  public show$ = this._show$.pipe(delay(1));

  ngOnChanges(changes: SimpleChanges) {
    // NOTE: The special "show" behavior is required because the initial state should always
    // be hidden for the CSS transition to work properly; so even if the initial value of show
    // is true on the first ngOnChanges, we delay it after the first render with hidden state
    this._show$.next(changes["show"].currentValue);
  }
}
