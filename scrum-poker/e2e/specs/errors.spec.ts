import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("errors", () => {
  test("session creation error", async ({ helper, page, locators }) => {
    await page.route(/localhost:4201\/.*/, (route) => route.abort());
    await page.goto("/");
    await locators.createSession.yourName.fill("Testmod1");
    await locators.createSession.submit.click();
    await expect(locators.errors.general.title).toBeVisible();

    await helper.visualComparison();
  });

  test("connection lost", async ({ helper, locators, page }) => {
    await page.goto("/connection-error");
    await expect(locators.errors.connectionLost.title).toBeVisible();

    await helper.visualComparison();
  });
});
