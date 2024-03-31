import { Page } from "@playwright/test";

/**
 * Centralizes locators used in e2e tests. Try to avoid using locators directly in tests
 * instead of re-using these here.
 */
export class Locators {
  constructor(private readonly page: Page) {}

  public get createSession() {
    return {
      yourName: this.page.getByLabel("Your name"),
      yourNameValidation: this.page.locator("css=.invalid-feedback"),
      sessionName: this.page.getByLabel("Session name"),
      submit: this.page.getByRole("button", { name: "submit" }),
    };
  }

  public get joinSession() {
    return {
      title: this.page.locator("css=h1", { hasText: "Join" }),
      yourName: this.page.getByLabel("Your name"),
      yourNameValidation: this.page.locator("css=.invalid-feedback", { hasText: "provide your name" }),
      role: this.page.getByLabel("Role"),
      roleValidation: this.page.locator("css=.invalid-feedback", { hasText: "provide your role" }),
      submit: this.page.getByRole("button", { name: "submit" }),
    };
  }

  public get session() {
    return {
      title: this.page.locator("css=h1"),
      participantsOwnPlayer: this.page.locator("css=.sp-player-own"),
      participantsOwnPlayerVoteBadge: this.page.locator("css=.sp-player-own").locator("xpath=..").locator("css=.sp-stack-active-child .badge"),
      participantsPlayerStatus: (participant: string) => ({
        stack: this.page
          .locator("css=.sp-participants-section > div", { hasText: "Guessers" })
          .locator("xpath=..")
          .locator("css=.list-group-item > span", { hasText: participant })
          .locator("xpath=..")
          .locator("css=app-stack"),
        notVotedSoFar: this.page.getByTitle("Did not make a selection so far"),
        statusVoted: this.page.locator("css=.sp-status-guessed"),
        voteBadge: this.page.locator("css=.badge"),
      }),
      guess: (value: number) => this.page.getByRole("button", { name: `${value}`, exact: true }),
      nudging: this.page.locator("css=.sp-guess-actions-nudge"),
      actions: {
        reset: this.page.getByRole("button", { name: "Reset" }),
        reveal: this.page.getByRole("button", { name: "Reveal" }),
        share: this.page.getByRole("button", { name: "Share" }),
        nudge: this.page.getByRole("button", { name: "Nudge" }),
      },
      result: {
        table: this.page.locator("css=table.table"),
        preferences: {
          dropdown: this.page.locator("css=.sp-card button.dropdown-toggle"),
          barChart: this.page.locator("css=button.dropdown-item", { hasText: "Bar" }),
          radialChart: this.page.locator("css=button.dropdown-item", { hasText: "Pie" }),
        },
        barChart: {
          chart: this.page.locator("css=.sp-bar-chart-container"),
          chartXAxisValue: this.page.locator("css=.sp-bar-chart-x-axis-value"),
          chartYAxisValue: this.page.locator("css=.sp-bar-chart-y-axis-value"),
        },
        radialChart: {
          chart: this.page.locator("css=.sp-radial-chart-container"),
        },
      },
    };
  }

  public get errors() {
    return {
      general: {
        title: this.page.getByRole("heading", { name: "Whoops" }),
      },
      connectionLost: {
        title: this.page.getByRole("heading", { name: "Connection lost" }),
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
