import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("misc", () => {
  test("legal", async ({ page, locators }) => {
    await page.goto("/");
    await locators.everywhere.footer.legal.click();
    await expect(page).toHaveURL(/legal/);
    await expect(locators.legal.email).toHaveText("Anzeigen");
    await locators.legal.email.hover();
    await expect(locators.legal.email).toHaveText(/.*@.*\..*/);
  });
});
