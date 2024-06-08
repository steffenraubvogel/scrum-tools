import { expect } from "@playwright/test";
import test from "../../fixtures";

test.describe("configure names", () => {
  test("add", async ({ helper, locators, page }) => {
    await page.goto("/wheel-of-names");

    await locators.wheelOfNames.configureNames.accordion.click();
    await expect(locators.wheelOfNames.configureNames.table.emptyRow).toBeVisible();

    await locators.wheelOfNames.configureNames.add.click();
    await helper.visualComparison();

    await locators.wheelOfNames.configureNames.dialog.nameInput.fill("Joe");
    await locators.wheelOfNames.configureNames.dialog.apply.click();
    await expect(locators.wheelOfNames.configureNames.table.row(0).name).toHaveText("Joe");
  });
});
