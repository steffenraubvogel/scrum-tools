import { Component, OnDestroy, OnInit } from "@angular/core";
import * as bootstrap from "bootstrap";

type Theme = "dark" | "dark-glass" | "light" | "neon" | "auto";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit, OnDestroy {
  private themeDropdown?: bootstrap.Dropdown;
  private readonly localStorageKey = "scrum-poker-theme";
  public selectedTheme!: Theme;

  public themes: { id: Theme; name: string }[] = [
    { id: "auto", name: "Auto" },
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "dark-glass", name: "Dark Glassy" },
  ];

  public ngOnInit(): void {
    const el = document.querySelector("#theme-dropdown");
    this.themeDropdown = new bootstrap.Dropdown(el!);

    // restore theme from local storage
    const storedTheme = localStorage.getItem(this.localStorageKey);
    if (!storedTheme) {
      this.setTheme("auto");
    } else {
      this.setTheme(storedTheme as Theme);
    }
  }

  public ngOnDestroy(): void {
    this.themeDropdown?.dispose();
  }

  public useTheme(event: Event, themeName: Theme) {
    event.preventDefault();
    this.setTheme(themeName);
  }

  private setTheme(themeName: Theme) {
    this.selectedTheme = themeName;
    localStorage.setItem(this.localStorageKey, themeName);
    const useTheme = themeName === "auto" ? this.detectOsPreference() : themeName;
    document.documentElement.setAttribute("data-bs-theme", useTheme);
  }

  private detectOsPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
}
