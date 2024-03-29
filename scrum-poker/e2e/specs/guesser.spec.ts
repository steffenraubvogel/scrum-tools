import { expect } from "@playwright/test";
import { Locators } from "e2e/locators";
import test from "../fixtures";

test.describe("guesser", () => {
  test("voting first", async ({ helper }) => {
    const session = await helper.prepareSession();
    const { locators: locators1, page } = await helper.joinSession(session.joinUrl, "guesser1");
    const { locators: locators2 } = await helper.joinSession(session.joinUrl, "guesser2");

    await expect(locators1.session.participantsOwnPlayer).toBeVisible();
    await expect(locators2.session.participantsOwnPlayer).toBeVisible();
    await helper.visualComparison(page);

    // guesser 2: vote 1 and check updated
    await locators2.session.guess(1).click();
    await expect(locators2.session.guess(1)).toHaveClass(/active/);
    await expect(locators2.session.participantsOwnPlayerVoteBadge).not.toBeVisible();

    // check in guesser1 page
    const statusGuesser1 = locators1.session.participantsPlayerStatus("guesser1");
    const statusStack1 = helper.stackComponent(statusGuesser1.stack);
    await statusStack1.expectActive(statusGuesser1.notVotedSoFar);

    const statusGuesser2 = locators1.session.participantsPlayerStatus("guesser2");
    const statusStack2 = helper.stackComponent(statusGuesser2.stack);
    await statusStack2.expectActive(statusGuesser2.statusVoted);

    // check in guesser2 page
    const statusGuesser1_ = locators2.session.participantsPlayerStatus("guesser1");
    const statusStack1_ = helper.stackComponent(statusGuesser1_.stack);
    await statusStack1_.expectActive(statusGuesser1_.notVotedSoFar);

    const statusGuesser2_ = locators2.session.participantsPlayerStatus("guesser2");
    const statusStack2_ = helper.stackComponent(statusGuesser2_.stack);
    await statusStack2_.expectActive(statusGuesser2_.statusVoted);
  });

  test("voting last", async ({ helper }) => {
    const session = await helper.prepareSession();
    const { locators: locators1, page } = await helper.joinSession(session.joinUrl, "guesser1");
    const { locators: locators2 } = await helper.joinSession(session.joinUrl, "guesser2");

    await expect(locators1.session.result.table).not.toBeVisible();
    await expect(locators1.session.result.chart).not.toBeVisible();

    // both guesser: vote 1 and check updated
    await locators1.session.guess(1).click();
    await locators2.session.guess(1).click();
    await expect(locators1.session.guess(1)).toHaveClass(/active/);
    await expect(locators2.session.guess(1)).toHaveClass(/active/);

    // check in guesser pages
    const checker = async (locators: Locators) => {
      const statusGuesser1 = locators.session.participantsPlayerStatus("guesser1");
      const statusStack1 = helper.stackComponent(statusGuesser1.stack);
      await statusStack1.expectActive(statusGuesser1.voteBadge);
      await statusStack1.expectText(statusGuesser1.voteBadge, "1");

      const statusGuesser2 = locators.session.participantsPlayerStatus("guesser2");
      const statusStack2 = helper.stackComponent(statusGuesser2.stack);
      await statusStack2.expectActive(statusGuesser2.voteBadge);
      await statusStack2.expectText(statusGuesser2.voteBadge, "1");

      await expect(locators.session.result.table).toBeVisible();
      await expect(locators.session.result.chart).toBeVisible();
      await expect(locators.session.result.chartXAxisValue).toHaveCount(1);
      await expect(locators.session.result.chartXAxisValue).toHaveText("1");
      await expect(locators.session.result.chartYAxisValue).toHaveCount(3);
      await expect(locators.session.result.chartYAxisValue.filter({ hasText: "2" })).toBeVisible();
    };

    for (let loc of [locators1, locators2]) {
      await checker(loc);
    }

    await helper.visualComparison(page);
  });
});
