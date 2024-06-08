import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, Routes } from "@angular/router";
import * as bootstrap from "bootstrap";
import { timer } from "rxjs";

@Component({
  selector: "app-wheel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./wheel-of-names.component.html",
  styleUrl: "./wheel-of-names.component.scss",
})
export class WheelComponent implements OnInit, AfterViewInit {
  public items: WheelItem[] = [];
  public math = Math;

  public rotating = false;
  public targetRotation = Math.random() * 360; // in degrees
  public rotationDuration = 4; // in seconds

  public colors: number[] = new Array(25).fill(0).map((_, i) => Math.floor((i / 25) * 360));

  public nameDialog = {
    enteredText: "",
    item: null as WheelItem | null,
    instance: null as unknown as bootstrap.Modal,
  };

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly destroyRef: DestroyRef
  ) {}

  public ngOnInit() {
    if (this.activatedRoute.snapshot.queryParams[CONFIG_URL_PARAM_NAME]) {
      this.restoreItemsFromUrlParam(this.activatedRoute.snapshot.queryParams[CONFIG_URL_PARAM_NAME]);
    } else {
      this.restoreItemsFromLocalStorage();
    }
  }

  public ngAfterViewInit() {
    const nameDialogElement = this.elementRef.nativeElement.querySelector("#name-dialog") as HTMLElement;
    nameDialogElement.addEventListener("shown.bs.modal", () => {
      const inputElement = this.elementRef.nativeElement.querySelector('input[name="name"]') as HTMLInputElement;
      inputElement.focus();
    });
    this.nameDialog.instance = new bootstrap.Modal(nameDialogElement, {});

    const shareDialogElement = this.elementRef.nativeElement.querySelector("#share-dialog") as HTMLElement;
    new bootstrap.Modal(shareDialogElement, {});
  }

  public get effectiveItems() {
    return this.items.filter((i) => i.active);
  }

  public prepareAddItem() {
    this.nameDialog.enteredText = "";
    this.nameDialog.item = null;
  }

  public applyItem() {
    if (!this.nameDialog.item) {
      this.addItem();
    } else {
      this.editItem();
    }
  }

  public addItem() {
    this.items.push({
      name: this.nameDialog.enteredText,
      active: true,
      color: this.pickClosestAvailableColor(this.determineNextColorHue()),
      fontSize: this.getFittingFontSize(this.nameDialog.enteredText),
    });
    this.saveItemsToLocalStorage();
    this.nameDialog.instance.hide();
  }

  private determineNextColorHue(): number {
    if (this.items.length === 0) {
      return Math.floor(Math.random() * 360);
    } else if (this.items.length === 1) {
      return (this.items[0].color + 180) % 360;
    }

    const sortedColors = this.items.map((i) => i.color).sort((a, b) => a - b);
    let colorDistance = sortedColors[0] + (360 - sortedColors[sortedColors.length - 1]);
    let nextColor = Math.floor((sortedColors[sortedColors.length - 1] + colorDistance / 2) % 360);

    for (let i = 0; i < sortedColors.length - 1; i++) {
      const dist = sortedColors[i + 1] - sortedColors[i];
      if (dist > colorDistance) {
        colorDistance = dist;
        nextColor = Math.floor(sortedColors[i] + dist / 2);
      }
    }

    return nextColor;
  }

  private pickClosestAvailableColor(color: number): number {
    let dist = -1;
    let idx = -1;

    for (let i = 0; i < this.colors.length; i++) {
      const thisDist = Math.abs(color - this.colors[i]);
      if (dist === -1 || thisDist < dist) {
        dist = thisDist;
        idx = i;
      }
    }

    return this.colors[idx];
  }

  public prepareEditItem(item: WheelItem) {
    this.nameDialog.enteredText = item.name;
    this.nameDialog.item = item;
  }

  public editItem() {
    this.nameDialog.item!.name = this.nameDialog.enteredText;
    this.nameDialog.item!.fontSize = this.getFittingFontSize(this.nameDialog.enteredText);
    this.saveItemsToLocalStorage();
    this.nameDialog.instance.hide();
  }

  public pickColor(item: WheelItem, hue: number) {
    item.color = hue;
    this.saveItemsToLocalStorage();
  }

  public removeItem(item: WheelItem) {
    this.items = this.items.filter((i) => i !== item);
    this.saveItemsToLocalStorage();
  }

  private saveItemsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, this.saveItemsToString());
  }

  private saveItemsToString() {
    return JSON.stringify({
      v: 1,
      i: this.items.map((item) => ({
        n: item.name,
        c: item.color,
      })),
    } satisfies StoredItems);
  }

  private restoreItemsFromLocalStorage() {
    try {
      const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!ls) {
        return;
      }
      const parsed = JSON.parse(ls) as StoredItems;
      this.restoreItemsFromObject(parsed);
    } catch (err) {
      console.warn(`Couldn't restore wheel from localStorage (key=${LOCAL_STORAGE_KEY})!`, err);
    }
  }

  private restoreItemsFromUrlParam(value: string) {
    try {
      const parsed = JSON.parse(atob(value)) as StoredItems;
      this.restoreItemsFromObject(parsed);
      this.saveItemsToLocalStorage();

      // clean up the URL
      this.router.navigate(["."], { relativeTo: this.activatedRoute, queryParams: {}, replaceUrl: true });
    } catch (err) {
      console.warn("Couldn't restore wheel from URL param!", err);
    }
  }

  private restoreItemsFromObject(parsed: StoredItems) {
    if (parsed.v === 1) {
      this.items = parsed.i.map((storedItem) => ({
        name: storedItem.n,
        active: true,
        color: storedItem.c,
        fontSize: this.getFittingFontSize(storedItem.n),
      }));
    }
  }

  public start() {
    this.rotating = true;
    this.targetRotation += 5 * 360 + Math.random() * 360;

    timer(1000 * this.rotationDuration)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // celebrate the winner
        this.rotating = false;
        const effectiveItems = this.effectiveItems;
        const winnerIndex = effectiveItems.length - 1 - Math.floor((((this.targetRotation - 90) % 360) / 360) * effectiveItems.length);
        const winnerItem = effectiveItems[winnerIndex];
        alert("And the winner is... " + winnerItem.name + "!");
      });
  }

  public share() {
    const shareUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      "/wheel-of-names?" +
      CONFIG_URL_PARAM_NAME +
      "=" +
      encodeURIComponent(btoa(this.saveItemsToString()));
    navigator.clipboard.writeText(shareUrl);
  }

  private getFittingFontSize(name: string) {
    const el = document.querySelector("#text-helper") as SVGTextElement;
    el.textContent = name;

    let fontSize = 14;
    let width = 0;
    do {
      fontSize = fontSize * 0.75;
      el.style.fontSize = fontSize + "px";
      width = el.getBBox({ stroke: true }).width;
    } while (width > 40);

    return fontSize;
  }

  public nameColor(hue: number) {
    return "hsl(" + hue + ", 100%, 60%)";
  }
}

const LOCAL_STORAGE_KEY = "wheel";
const CONFIG_URL_PARAM_NAME = "config";

type WheelItem = {
  name: string;
  active: boolean;
  color: number; // hue 0 - 360
  fontSize: number; // in px
};

// not all properties of WheelItem are stored and property names are shortened (to compress configuration URL parameter)
type StoredItems = {
  v: number; // version
  i: {
    n: string; // name
    c: number; // color
  }[]; // items
};

export const ROUTES: Routes = [{ path: "**", component: WheelComponent }];
