import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("join session", () => {
  let joinUrl: string;

  test.beforeEach(async ({ helper, locators, page }) => {
    joinUrl = (await helper.prepareSession()).joinUrl;

    await page.goto(joinUrl);
    await expect(locators.joinSession.title).toBeVisible();
  });

  test("with invalid inputs", async ({ locators, page }) => {
    // leave fields empty and submit -> name and role is required
    await locators.joinSession.submit.click();
    await expect(page).toHaveURL(joinUrl);
    await expect(locators.joinSession.yourNameValidation).toBeVisible();
    await expect(locators.joinSession.roleValidation).toBeVisible();

    await locators.joinSession.yourName.fill("Testjoinuser");
    await locators.joinSession.submit.click();
    await expect(page).toHaveURL(joinUrl);
    await expect(locators.joinSession.roleValidation).toBeVisible();
  });

  test("with valid inputs (guesser)", async ({ helper, locators, page }) => {
    await locators.joinSession.yourName.fill("Testjoinuser");
    await locators.joinSession.role.selectOption("Guesser");
    await locators.joinSession.submit.click();

    await expect(page).toHaveURL(/\/session\/.*/);
    await expect(locators.session.participantsOwnPlayer).toHaveText("Testjoinuser");

    await helper.visualComparison();
  });

  test("with valid inputs (observer)", async ({ helper, locators, page }) => {
    await locators.joinSession.yourName.fill("Testobserver");
    await locators.joinSession.role.selectOption("Observer");
    await locators.joinSession.submit.click();

    await expect(page).toHaveURL(/\/session\/.*/);
    await expect(locators.session.participantsOwnPlayer).toHaveText("Testobserver");
    await expect(page.getByRole("heading", { name: "Oberserver Actions" })).toBeVisible();

    await helper.visualComparison();
  });
});
