import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("errors", () => {
  test("general error", async ({ helper, page, locators }) => {
    await page.goto("/error");
    await expect(locators.errors.general.title).toBeVisible();

    await helper.visualComparison();
  });
});
