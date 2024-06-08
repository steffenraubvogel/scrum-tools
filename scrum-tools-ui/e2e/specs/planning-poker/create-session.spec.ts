import { expect } from "@playwright/test";
import test from "../../fixtures";

test.describe("create session", () => {
  test("with invalid inputs", async ({ locators, page }) => {
    await page.goto("/planning-poker");
    // leave fields empty and submit -> name is required
    await locators.planningPoker.createSession.submit.click();

    await expect(page).toHaveURL("/planning-poker");
    await expect(locators.planningPoker.createSession.yourNameValidation).toBeVisible();
  });

  test("with valid inputs", async ({ helper, locators, page }) => {
    await page.goto("/planning-poker");

    await helper.visualComparison();

    await locators.planningPoker.createSession.yourName.fill("Testuser");
    await locators.planningPoker.createSession.sessionName.fill("Testsession1");
    await locators.planningPoker.createSession.submit.click();

    await expect(page).toHaveURL(/\/planning-poker\/session\/.*/);
    await expect(locators.planningPoker.session.title).toContainText("Testsession1");
    await expect(locators.planningPoker.session.participantsOwnPlayer).toHaveText("Testuser");
  });
});
