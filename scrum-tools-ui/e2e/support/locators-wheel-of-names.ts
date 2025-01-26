import { Page } from "@playwright/test";

/**
 * See Locators.
 */
export class WheelOfNamesLocators {
  constructor(private readonly page: Page) {}

  public get configureNames() {
    return {
      accordion: this.page.getByRole("button", { name: "Configure" }),
      table: (() => {
        const base = this.page.locator("css=#accordion-item-1 table");
        return {
          emptyRow: base.getByRole("row", { name: "-", exact: true }),
          row: (index: number) => {
            const r = base.locator(`css=tr:nth-child(${index + 1})`);
            return {
              name: r.locator("css=td:first-child"),
              editButton: r.locator("css=td:last-child button:first-child"),
              deleteButton: r.locator("css=td:last-child button:last-child"),
            };
          },
        };
      })(),
      add: this.page.getByRole("button", { name: "Add Name" }),
      dialog: {
        nameInput: this.page.getByRole("dialog", { name: "Name" }).locator('css=input[name="name"]'),
        apply: this.page.getByRole("dialog", { name: "Name" }).getByRole("button", { name: "Apply" }),
      },
    };
  }

  public get wheel() {
    return {
      start: this.page.getByRole("button", { name: "Start" }),
      share: this.page.getByRole("button", { name: "Share" }),
      winnerDialog: {
        winner: this.page.getByRole("dialog", { name: "Winner" }).locator("css=.modal-body span"),
        spinAgainButton: this.page.getByRole("dialog", { name: "Winner" }).getByRole("button", { name: "Spin Again" }),
      },
      shareDialog: {
        copyButton: this.page.getByRole("dialog", { name: "Share" }).getByRole("button", { name: "Copy URL" }),
      },
    };
  }
}
