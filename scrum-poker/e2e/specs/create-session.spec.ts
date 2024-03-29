import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("create session", () => {
  test("with invalid inputs", async ({ locators, page }) => {
    await page.goto("/");
    // leave fields empty and submit -> name is required
    await locators.createSession.submit.click();

    await expect(page).toHaveURL("/");
    await expect(locators.createSession.yourNameValidation).toBeVisible();
  });

  test("with valid inputs", async ({ helper, locators, page }) => {
    await page.goto("/");

    await helper.visualComparison();

    await locators.createSession.yourName.fill("Testuser");
    await locators.createSession.sessionName.fill("Testsession1");
    await locators.createSession.submit.click();

    await expect(page).toHaveURL(/\/session\/.*/);
    await expect(locators.session.title).toHaveText("Testsession1");
    await expect(locators.session.participantsOwnPlayer).toHaveText("Testuser");
  });
});
