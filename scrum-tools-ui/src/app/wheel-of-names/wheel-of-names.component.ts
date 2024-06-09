import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Routes } from "@angular/router";
import * as bootstrap from "bootstrap";
import { timer } from "rxjs";
import { NamesEditorComponent } from "./components/names-editor.component";
import { NameItem, NamesService } from "./service/names.service";

@Component({
  selector: "app-wheel",
  standalone: true,
  imports: [CommonModule, FormsModule, NamesEditorComponent],
  providers: [NamesService],
  templateUrl: "./wheel-of-names.component.html",
  styleUrl: "./wheel-of-names.component.scss",
})
export class WheelComponent implements OnInit {
  public items: WheelItem[] = [];
  public math = Math;

  public rotating = false;
  public targetRotation = Math.random() * 360; // in degrees
  public rotationDuration = 4; // in seconds

  private winnerDialog!: bootstrap.Modal;
  public winner?: WheelItem;

  constructor(
    public readonly namesService: NamesService,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    this.namesService.itemChanges.subscribe((i) => {
      this.items = i.map((k) => ({
        ...k,
        fontSize: this.getFittingFontSize(k.name),
      }));
    });

    const shareDialogElement = this.elementRef.nativeElement.querySelector("#share-dialog") as HTMLElement;
    new bootstrap.Modal(shareDialogElement, {});

    const winnerDialogElement = this.elementRef.nativeElement.querySelector("#winner-dialog") as HTMLElement;
    this.winnerDialog = new bootstrap.Modal(winnerDialogElement, {});
  }

  public get effectiveItems() {
    return this.items.filter((i) => i.active);
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
        this.winner = effectiveItems[winnerIndex];
        this.winnerDialog.show();
      });
  }

  public share() {
    const shareUrl = this.namesService.generateShareUrl();
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
    } while (width > 40 && fontSize > 1);

    return fontSize;
  }

  public nameColor(hue: number) {
    return "hsl(" + hue + ", 100%, 60%)";
  }
}

type WheelItem = NameItem & {
  fontSize: number; // in px
};

export const ROUTES: Routes = [{ path: "**", component: WheelComponent }];
