import { expect } from "@playwright/test";
import test from "../fixtures";

test.describe("moderator", () => {
  test("reset", async ({ locators, helper }) => {
    const { joinUrl, page } = await helper.prepareSession("Mod1", true);
    const { locators: locators1 } = await helper.joinSession(joinUrl, "guesser1");
    const { locators: locators2 } = await helper.joinSession(joinUrl, "guesser2");

    await locators1.session.guess(1).click();
    await locators2.session.guess(1).click();

    await expect(locators.session.result.table).toBeVisible();
    await expect(locators.session.result.chart).toBeVisible();

    // reset and check updated
    await locators.session.actions.reset.click();
    await expect(locators.session.result.table).not.toBeVisible();
    await expect(locators.session.result.chart).not.toBeVisible();

    for (let g of ["guesser1", "guesser2"]) {
      const statusGuesser1 = locators.session.participantsPlayerStatus(g);
      const statusStack1 = helper.stackComponent(statusGuesser1.stack);
      await statusStack1.expectActive(statusGuesser1.notVotedSoFar);
    }

    await helper.visualComparison(page);
  });

  test("reveal", async ({ locators, helper }) => {
    const { joinUrl } = await helper.prepareSession("Mod1", true);
    const { locators: locators1 } = await helper.joinSession(joinUrl, "guesser1");
    await helper.joinSession(joinUrl, "guesser2");

    await locators1.session.guess(1).click();

    await expect(locators.session.result.table).not.toBeVisible();
    await expect(locators.session.result.chart).not.toBeVisible();

    // reveal and check updated
    await locators.session.actions.reveal.click();
    await expect(locators.session.result.table).toBeVisible();
    await expect(locators.session.result.chart).toBeVisible();

    const statusGuesser1 = locators.session.participantsPlayerStatus("guesser1");
    const statusStack1 = helper.stackComponent(statusGuesser1.stack);
    await statusStack1.expectActive(statusGuesser1.voteBadge);
    await statusStack1.expectText(statusGuesser1.voteBadge, "1");

    const statusGuesser2 = locators.session.participantsPlayerStatus("guesser2");
    const statusStack2 = helper.stackComponent(statusGuesser2.stack);
    await statusStack2.expectActive(statusGuesser2.voteBadge);
    await statusStack2.expectText(statusGuesser2.voteBadge, "-");
  });

  test("share", async ({ context, helper, browserName }) => {
    test.skip(browserName !== "chromium", "This test works for chromium only");

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const { locators, page } = await helper.prepareSession("Mod1", true);
    await locators.session.actions.share.click();

    const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
    const clipboardContent = await handle.jsonValue();
    expect(clipboardContent).toMatch(/join\/.*$/);
  });

  test("nudge", async ({ helper }) => {
    const { joinUrl, locators } = await helper.prepareSession("Mod1", true);
    const { locators: locators1 } = await helper.joinSession(joinUrl, "guesser1");
    const { locators: locators2 } = await helper.joinSession(joinUrl, "guesser2");

    await locators2.session.guess(1).click();
    const statusGuesser2 = locators.session.participantsPlayerStatus("guesser2");
    const statusStack2 = helper.stackComponent(statusGuesser2.stack);
    await statusStack2.expectActive(statusGuesser2.statusVoted);
    await locators.session.actions.nudge.click();

    await expect(locators1.session.nudging).toBeVisible();
    await expect(locators2.session.nudging).not.toBeVisible();
  });
});
