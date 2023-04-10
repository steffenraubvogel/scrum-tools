import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
  selector: "[unobfuscate]",
})
export class ObfuscateDirective {
  private activated = false;

  constructor(private element: ElementRef, private renderer: Renderer2) {}

  @HostListener("mouseenter")
  public onMouseEnter() {
    if (!this.activated) {
      this.activated = true;
      this.unobfuscate();
    }
  }

  private unobfuscate() {
    const nativeElement = this.element.nativeElement as HTMLAnchorElement;
    const obfuscatedEmail = nativeElement.href.split("mailto:")[1];
    const plainEmail = [...obfuscatedEmail].reduce((prev, cur) => cur + prev);
    this.renderer.removeChild(nativeElement, nativeElement.childNodes[0]);
    this.renderer.appendChild(nativeElement, this.renderer.createText(plainEmail));
    this.renderer.setProperty(nativeElement, "href", "mailto:" + plainEmail);
  }
}
