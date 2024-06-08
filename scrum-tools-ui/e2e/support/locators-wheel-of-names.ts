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
            };
          },
        };
      })(),
      add: this.page.getByRole("button", { name: "Add Name" }),
      dialog: {
        nameInput: this.page.locator('css=input[name="name"]'),
        apply: this.page.getByRole("button", { name: "Apply" }),
      },
    };
  }
}
