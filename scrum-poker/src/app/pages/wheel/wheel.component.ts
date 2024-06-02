import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Routes } from "@angular/router";

@Component({
  selector: "app-wheel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./wheel.component.html",
  styleUrl: "./wheel.component.scss",
})
export class WheelComponent {
  public items: WheelItem[] = [];
  public math = Math;

  constructor() {
    this.restoreItems();
  }

  public get effectiveItems() {
    return this.items.filter((i) => i.active);
  }

  public addItem() {
    const name = prompt("Enter a name for the new item:");
    if (!name) {
      return;
    }

    this.items.push({
      name,
      active: true,
      color: this.determineNextColorHue(),
    });
    this.saveItems();
  }

  private determineNextColorHue(): number {
    return Math.random() * 360;
  }

  public removeItem(item: WheelItem) {
    this.items = this.items.filter((i) => i !== item);
    this.saveItems();
  }

  private saveItems() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: this.items,
      } satisfies StoredItems)
    );
  }

  private restoreItems() {
    try {
      const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!ls) {
        return;
      }
      const parsed = JSON.parse(ls) as StoredItems;
      if (parsed.version === 1) {
        this.items = parsed.items;
      }
    } catch (err) {
      console.warn(`Couldn\'t restore wheel from localStorage (key=${LOCAL_STORAGE_KEY})!`);
    }
  }
}

const LOCAL_STORAGE_KEY = "wheel";

type WheelItem = {
  name: string;
  active: boolean;
  color: number; // hue 0 - 360
};

type StoredItems = {
  version: number;
  items: WheelItem[];
};

export const ROUTES: Routes = [{ path: "**", component: WheelComponent }];
