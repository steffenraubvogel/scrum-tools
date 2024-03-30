import { Component, Input, OnChanges } from "@angular/core";
import { ChartDataPoint } from "../chart-commons";

@Component({
  selector: "app-radial-chart",
  templateUrl: "./radial-chart.component.html",
  styleUrl: "./radial-chart.component.scss",
})
export class RadialChartComponent implements OnChanges {
  @Input()
  public axisLabel: string = "";

  @Input()
  public axisMaxValue: number = 1; // must be at least 1

  @Input()
  public allCategories: RadialCategory[] = [];

  @Input()
  public data: ChartDataPoint[] = [];

  public arcs: Arc[] = [];

  public axisTicks: number[] = [];

  public math = Math;

  ngOnChanges() {
    this.arcs = this.calcArcs();
    this.axisTicks = this.calcAxisTicks();
  }

  private calcArcs() {
    const arcs: Arc[] = [];

    for (let idx = 0; idx < this.allCategories.length; idx++) {
      let dataPoint = this.data.find((dp) => dp.x === this.allCategories[idx].name);
      if (!dataPoint) {
        dataPoint = {
          x: this.allCategories[idx].name,
          y: 0,
          color: this.allCategories[idx].color,
        };
      }

      arcs.push({
        end: {
          x: 50 + Math.sin((2 * Math.PI) / this.allCategories.length) * 50,
          y: 50 - Math.cos((2 * Math.PI) / this.allCategories.length) * 50,
        },
        rotation: (360 / this.allCategories.length) * idx,
        scale: dataPoint ? (1 / this.axisMaxValue) * dataPoint.y : 0,
        details: dataPoint,
      });
    }

    return arcs;
  }

  private calcAxisTicks() {
    if (this.axisMaxValue >= 2) {
      if (this.axisMaxValue % 2 === 0) {
        return [this.axisMaxValue / 2, this.axisMaxValue];
      }
      return [(this.axisMaxValue - 1) / 2, this.axisMaxValue - 1];
    }
    return [this.axisMaxValue];
  }

  public trackDataPointByCategory(index: number, item: Arc) {
    return item.details.x;
  }
}

type Arc = {
  end: {
    x: number;
    y: number;
  };
  rotation: number; // degrees
  scale: number; // 0 -> none, 1 -> max value
  details: ChartDataPoint;
};

type RadialCategory = {
  name: string;
  color: string;
};
