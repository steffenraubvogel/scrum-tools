import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

export type ChartDataPoint = {
  x: string;
  y: number;
  tooltip?: string;
  color: string;
};

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
  public yAxisMaxValue: number = 7; // must be at least 1

  @Input()
  public data: ChartDataPoint[] = [
    {
      x: "1",
      y: 1,
      color: "var(--sp-chart-color-1)",
    },
    {
      x: "2",
      y: 3,
      color: "var(--sp-chart-color-2)",
    },
    {
      x: "8",
      y: 2,
      color: "var(--sp-chart-color-8)",
    },
    {
      x: "?",
      y: 1,
      color: "var(--sp-chart-color-abstained)",
    },
  ];

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
