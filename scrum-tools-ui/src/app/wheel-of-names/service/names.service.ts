import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject } from "rxjs";

const CONFIG_URL_PARAM_NAME = "cfg";
const LOCAL_STORAGE_KEY = "wheel-of-names";

@Injectable()
export class NamesService {
  private _items: NameItem[] = [];
  private _itemChanges = new ReplaySubject<NameItem[]>(1);

  public get items(): NameItem[] {
    return this._items.map((i) => ({ ...i }));
  }

  public set items(i: NameItem[]) {
    this._items = i.map((k) => ({ ...k }));
    this.saveItemsToLocalStorage();
    this._itemChanges.next(this.items);
  }

  public get itemChanges() {
    return this._itemChanges.asObservable();
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.restoreItemsFromLocalStorage();

    if (this.activatedRoute.snapshot.queryParams[CONFIG_URL_PARAM_NAME]) {
      this.restoreItemsFromUrlParam(this.activatedRoute.snapshot.queryParams[CONFIG_URL_PARAM_NAME]);

      // clean up the URL
      this.router.navigate(["."], { relativeTo: this.activatedRoute, queryParams: {}, replaceUrl: true });
    }
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
      }));
    }
  }

  public generateShareUrl() {
    return (
      window.location.protocol +
      "//" +
      window.location.host +
      "/wheel-of-names?" +
      CONFIG_URL_PARAM_NAME +
      "=" +
      encodeURIComponent(btoa(this.saveItemsToString()))
    );
  }
}

export type NameItem = {
  name: string;
  active: boolean;
  color: number; // hue 0 - 360
};

// not all properties of WheelItem are stored and property names are shortened (to compress configuration URL parameter)
type StoredItems = {
  v: number; // version
  i: {
    n: string; // name
    c: number; // color
  }[]; // items
};
