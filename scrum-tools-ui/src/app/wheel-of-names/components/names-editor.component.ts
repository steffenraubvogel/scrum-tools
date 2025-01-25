import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap";
import { NameItem, NamesService } from "../service/names.service";

@Component({
  selector: "app-names-editor",
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./names-editor.component.html",
  styleUrl: "./names-editor.component.scss",
})
export class NamesEditorComponent implements AfterViewInit {
  public colors: number[] = new Array(25).fill(0).map((_, i) => Math.floor((i / 25) * 360));

  public nameDialog = {
    formGroup: new FormGroup({
      name: new FormControl<string>("", [Validators.required, Validators.maxLength(20), this.validateUnique.bind(this)]),
    }),
    validated: false,
    item: null as NameItem | null,
    instance: null as unknown as bootstrap.Modal,
  };

  constructor(
    public readonly namesService: NamesService,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  public ngAfterViewInit() {
    const nameDialogElement = this.elementRef.nativeElement.querySelector("#name-dialog") as HTMLElement;
    nameDialogElement.addEventListener("shown.bs.modal", () => {
      const inputElement = this.elementRef.nativeElement.querySelector('input[name="name"]') as HTMLInputElement;
      inputElement.focus();
    });
    this.nameDialog.instance = new bootstrap.Modal(nameDialogElement, {});
  }

  private validateUnique(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (name && typeof name === "string") {
      const existingNames = this.namesService.items
        .filter((i) => this.nameDialog.item === null || this.nameDialog.item.name !== i.name)
        .map((i) => i.name);

      if (existingNames.includes(name)) {
        return {
          unique: false,
        };
      }
    }
    return null;
  }

  public prepareAddItem() {
    this.nameDialog.item = null;
    this.nameDialog.validated = false;
    this.nameDialog.formGroup.reset();
  }

  public applyItem() {
    if (this.nameDialog.formGroup.invalid) {
      this.nameDialog.validated = true;
      return;
    }

    if (!this.nameDialog.item) {
      this.addItem();
    } else {
      this.editItem();
    }
  }

  public addItem() {
    this.namesService.items = [
      ...this.namesService.items,
      {
        name: this.nameDialog.formGroup.value.name!,
        active: true,
        color: this.pickClosestAvailableColor(this.determineNextColorHue()),
      },
    ];
    this.nameDialog.instance.hide();
  }

  private determineNextColorHue(): number {
    if (this.namesService.items.length === 0) {
      return Math.floor(Math.random() * 360);
    } else if (this.namesService.items.length === 1) {
      return (this.namesService.items[0].color + 180) % 360;
    }

    const sortedColors = this.namesService.items.map((i) => i.color).sort((a, b) => a - b);
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

  public prepareEditItem(item: NameItem) {
    this.nameDialog.item = item;
    this.nameDialog.validated = false;
    this.nameDialog.formGroup.setValue({ name: item.name });
  }

  public editItem() {
    this.internalEditItem(this.nameDialog.item!, (i) => (i.name = this.nameDialog.formGroup.value.name!));
    this.nameDialog.instance.hide();
  }

  public pickItemColor(item: NameItem, hue: number) {
    this.internalEditItem(item, (i) => (i.color = hue));
  }

  public enableItem(item: NameItem, value: boolean) {
    this.internalEditItem(item, (i) => (i.active = value));
  }

  private internalEditItem(item: NameItem, editCallback: (i: NameItem) => void) {
    const items = this.namesService.items;
    const itemToBeEdit = items.find((i) => i.name === item!.name)!;
    editCallback(itemToBeEdit);
    this.namesService.items = items;
  }

  public sortItems() {
    this.namesService.items = this.namesService.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  public clearItems() {
    this.namesService.items = [];
  }

  public removeItem(item: NameItem) {
    this.namesService.items = this.namesService.items.filter((i) => i.name !== item.name);
  }

  public nameColor(hue: number) {
    return "hsl(" + hue + ", 100%, 60%)";
  }
}
