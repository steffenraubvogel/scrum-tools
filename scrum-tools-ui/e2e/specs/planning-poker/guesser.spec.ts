import { expect } from "@playwright/test";
import { Locators } from "e2e/support/locators";
import test from "../../fixtures";

test.describe("guesser", () => {
  test("voting first", async ({ helper }) => {
    const session = await helper.planningPoker.prepareSession();
    const { locators: locators1, page } = await helper.planningPoker.joinSession(session.joinUrl, "guesser1");
    const { locators: locators2 } = await helper.planningPoker.joinSession(session.joinUrl, "guesser2");

    await expect(locators1.planningPoker.session.participantsOwnPlayer).toBeVisible();
    await expect(locators2.planningPoker.session.participantsOwnPlayer).toBeVisible();
    await helper.visualComparison(page);

    // guesser 2: vote 1 and check updated
    await locators2.planningPoker.session.guess(1).click();
    await expect(locators2.planningPoker.session.guess(1)).toHaveClass(/active/);
    await expect(locators2.planningPoker.session.participantsOwnPlayerVoteBadge).not.toBeVisible();

    // check in guesser1 page
    const statusGuesser1 = locators1.planningPoker.session.participantsPlayerStatus("guesser1");
    const statusStack1 = helper.planningPoker.stackComponent(statusGuesser1.stack);
    await statusStack1.expectActive(statusGuesser1.notVotedSoFar);

    const statusGuesser2 = locators1.planningPoker.session.participantsPlayerStatus("guesser2");
    const statusStack2 = helper.planningPoker.stackComponent(statusGuesser2.stack);
    await statusStack2.expectActive(statusGuesser2.statusVoted);

    // check in guesser2 page
    const statusGuesser1_ = locators2.planningPoker.session.participantsPlayerStatus("guesser1");
    const statusStack1_ = helper.planningPoker.stackComponent(statusGuesser1_.stack);
    await statusStack1_.expectActive(statusGuesser1_.notVotedSoFar);

    const statusGuesser2_ = locators2.planningPoker.session.participantsPlayerStatus("guesser2");
    const statusStack2_ = helper.planningPoker.stackComponent(statusGuesser2_.stack);
    await statusStack2_.expectActive(statusGuesser2_.statusVoted);
  });

  test("voting last", async ({ helper }) => {
    const session = await helper.planningPoker.prepareSession();
    const { locators: locators1, page } = await helper.planningPoker.joinSession(session.joinUrl, "guesser1");
    const { locators: locators2 } = await helper.planningPoker.joinSession(session.joinUrl, "guesser2");

    await expect(locators1.planningPoker.session.result.table).not.toBeVisible();
    await expect(locators1.planningPoker.session.result.barChart.chart).not.toBeVisible();

    // both guesser: vote 1 and check updated
    await locators1.planningPoker.session.guess(1).click();
    await locators2.planningPoker.session.guess(1).click();
    await expect(locators1.planningPoker.session.guess(1)).toHaveClass(/active/);
    await expect(locators2.planningPoker.session.guess(1)).toHaveClass(/active/);

    // check in guesser pages
    const checker = async (locators: Locators) => {
      const statusGuesser1 = locators.planningPoker.session.participantsPlayerStatus("guesser1");
      const statusStack1 = helper.planningPoker.stackComponent(statusGuesser1.stack);
      await statusStack1.expectActive(statusGuesser1.voteBadge);
      await statusStack1.expectText(statusGuesser1.voteBadge, "1");

      const statusGuesser2 = locators.planningPoker.session.participantsPlayerStatus("guesser2");
      const statusStack2 = helper.planningPoker.stackComponent(statusGuesser2.stack);
      await statusStack2.expectActive(statusGuesser2.voteBadge);
      await statusStack2.expectText(statusGuesser2.voteBadge, "1");

      await expect(locators.planningPoker.session.result.table).toBeVisible();
      await expect(locators.planningPoker.session.result.barChart.chart).toBeVisible(); // bar chart active by default
      await expect(locators.planningPoker.session.result.barChart.chartXAxisValue).toHaveCount(1);
      await expect(locators.planningPoker.session.result.barChart.chartXAxisValue).toHaveText("1");
      await expect(locators.planningPoker.session.result.barChart.chartYAxisValue).toHaveCount(3);
      await expect(locators.planningPoker.session.result.barChart.chartYAxisValue.filter({ hasText: "2" })).toBeVisible();
    };

    for (let loc of [locators1, locators2]) {
      await checker(loc);
    }

    await helper.visualComparison(page);

    // switch chart to radial and check
    await locators1.planningPoker.session.result.preferences.dropdown.click();
    await expect(locators1.planningPoker.session.result.preferences.barChart).toHaveClass(/active/);
    await locators1.planningPoker.session.result.preferences.radialChart.click();

    await expect(locators1.planningPoker.session.result.radialChart.chart).toBeVisible();
    await helper.visualComparison(page);
  });
});
