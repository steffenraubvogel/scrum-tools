import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ChartDataPoint } from "../chart-commons";

@Component({
  selector: "app-bar-chart",
  templateUrl: "./bar-chart.component.html",
  styleUrls: ["./bar-chart.component.scss"],
})
export class BarChartComponent implements OnChanges {
  @Input()
  public xAxisLabel: string = "";

  @Input()
  public yAxisLabel: string = "";

  @Input()
  public yAxisMaxValue: number = 1; // must be at least 1

  @Input()
  public data: ChartDataPoint[] = [];

  public yTicks: number[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.yTicks = this.calcYTicks();
  }

  private calcYTicks() {
    if (this.yAxisMaxValue >= 2) {
      if (this.yAxisMaxValue % 2 === 0) {
        return [0, this.yAxisMaxValue / 2, this.yAxisMaxValue];
      }
      return [0, (this.yAxisMaxValue - 1) / 2, this.yAxisMaxValue - 1];
    }
    return [0, this.yAxisMaxValue];
  }

  public trackDataPointByValue(index: number, item: ChartDataPoint) {
    return item.x;
  }
}
