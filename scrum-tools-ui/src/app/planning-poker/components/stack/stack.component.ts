import { Component, ContentChildren, Directive, Input, TemplateRef } from "@angular/core";

@Directive({
  selector: "[stackChild]",
  standalone: false,
})
export class StackChildDirective {}

/**
 * Stacks child components on top but shows the active child only. The component
 * will reserve space by its largest child. There is a transition when switching
 * the active child.
 */
@Component({
  selector: "app-stack",
  templateUrl: "./stack.component.html",
  styleUrls: ["./stack.component.scss"],
  standalone: false,
})
export class StackComponent {
  @ContentChildren(StackChildDirective, { read: TemplateRef })
  public templates: TemplateRef<any>[] = [];

  @Input()
  public activeChild: number = 0;
}
