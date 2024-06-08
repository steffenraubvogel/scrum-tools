import { expect } from "@playwright/test";
import test from "../../fixtures";

test.describe("errors", () => {
  test("session creation error", async ({ page, locators }) => {
    await page.route(/localhost:4201\/.*/, (route) => route.abort());
    await page.goto("/planning-poker");
    await locators.planningPoker.createSession.yourName.fill("Testmod1");
    await locators.planningPoker.createSession.submit.click();
    await expect(locators.errors.general.title).toBeVisible();
  });

  test("connection lost", async ({ helper, locators, page }) => {
    await page.goto("/planning-poker/connection-error");
    await expect(locators.planningPoker.errors.connectionLost.title).toBeVisible();

    await helper.visualComparison();
  });
});
