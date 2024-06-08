import { expect } from "@playwright/test";
import test from "../../fixtures";

test.describe("join session", () => {
  let joinUrl: string;

  test.beforeEach(async ({ helper, locators, page }) => {
    joinUrl = (await helper.planningPoker.prepareSession()).joinUrl;

    await page.goto(joinUrl);
    await expect(locators.planningPoker.joinSession.title).toBeVisible();
  });

  test("with invalid inputs", async ({ locators, page }) => {
    // leave fields empty and submit -> name and role is required
    await locators.planningPoker.joinSession.submit.click();
    await expect(page).toHaveURL(joinUrl);
    await expect(locators.planningPoker.joinSession.yourNameValidation).toBeVisible();
    await expect(locators.planningPoker.joinSession.roleValidation).toBeVisible();

    await locators.planningPoker.joinSession.yourName.fill("Testjoinuser");
    await locators.planningPoker.joinSession.submit.click();
    await expect(page).toHaveURL(joinUrl);
    await expect(locators.planningPoker.joinSession.roleValidation).toBeVisible();
  });

  test("with valid inputs (guesser)", async ({ helper, locators, page }) => {
    await locators.planningPoker.joinSession.yourName.fill("Testjoinuser");
    await locators.planningPoker.joinSession.role.selectOption("Guesser");
    await locators.planningPoker.joinSession.submit.click();

    await expect(page).toHaveURL(/\/planning-poker\/session\/.*/);
    await expect(locators.planningPoker.session.participantsOwnPlayer).toHaveText("Testjoinuser");

    await helper.visualComparison();
  });

  test("with valid inputs (observer)", async ({ helper, locators, page }) => {
    await locators.planningPoker.joinSession.yourName.fill("Testobserver");
    await locators.planningPoker.joinSession.role.selectOption("Observer");
    await locators.planningPoker.joinSession.submit.click();

    await expect(page).toHaveURL(/\/planning-poker\/session\/.*/);
    await expect(locators.planningPoker.session.participantsOwnPlayer).toHaveText("Testobserver");
    await expect(page.getByRole("heading", { name: "Oberserver Actions" })).toBeVisible();

    await helper.visualComparison();
  });
});
