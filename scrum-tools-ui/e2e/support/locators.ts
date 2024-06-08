import { Page } from "@playwright/test";
import { PlanningPokerLocators } from "./locators-planning-poker";
import { WheelOfNamesLocators } from "./locators-wheel-of-names";

/**
 * Centralizes locators used in e2e tests. Try to avoid using locators directly in tests
 * instead of re-using these here.
 */
export class Locators {
  public planningPoker: PlanningPokerLocators;
  public wheelOfNames: WheelOfNamesLocators;

  constructor(private readonly page: Page) {
    this.planningPoker = new PlanningPokerLocators(page);
    this.wheelOfNames = new WheelOfNamesLocators(page);
  }

  public get errors() {
    return {
      general: {
        title: this.page.getByRole("heading", { name: "Whoops" }),
      },
    };
  }

  public get legal() {
    return {
      email: this.page.locator('css=a[href^="mailto"]'),
    };
  }

  public get everywhere() {
    return {
      footer: {
        legal: this.page.getByRole("link", { name: "legal" }),
      },
    };
  }
}
