import { expect } from "@playwright/test";
import test from "../../fixtures";

test.describe("wheel", () => {
  test("play", async ({ helper, locators, page }) => {
    await helper.wheelOfNames.prepareNames([
      { name: "Joe", color: 0 },
      { name: "Albert", color: 120 },
    ]);

    await locators.wheelOfNames.wheel.start.click();
    await page.waitForTimeout(4000); // rotation duration
    await expect(locators.wheelOfNames.wheel.winnerDialog.winner).toHaveText(/(Joe|Albert)!/);

    await locators.wheelOfNames.wheel.winnerDialog.spinAgainButton.click();
    await expect(locators.wheelOfNames.wheel.winnerDialog.spinAgainButton).toBeHidden();
    await page.waitForTimeout(4000); // rotation duration
    await expect(locators.wheelOfNames.wheel.winnerDialog.winner).toHaveText(/(Joe|Albert)!/);
  });

  test("share", async ({ helper, locators, page, browserName }) => {
    test.skip(browserName !== "chromium", "This test works for chromium only");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await helper.wheelOfNames.prepareNames([
      { name: "Joe", color: 0 },
      { name: "Albert", color: 120 },
    ]);

    await locators.wheelOfNames.wheel.share.click();
    await locators.wheelOfNames.wheel.shareDialog.copyButton.click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("/wheel-of-names?cfg=");

    const itemsJson = atob(clipboard.replace(/^.*\?cfg=/, ""));
    expect(itemsJson).toContain("Joe");
    expect(itemsJson).toContain("Albert");

    await expect(locators.wheelOfNames.wheel.shareDialog.copyButton).toBeHidden();
  });
});
